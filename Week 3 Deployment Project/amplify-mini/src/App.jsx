import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { generateClient } from 'aws-amplify/data';
import { Authenticator, View, Text, Button, TextField, Flex } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);
const client = generateClient();

export default function App() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  async function refresh() {
    const { data } = await client.models.Message.list();
    // newest first just for fun
    setMessages(data?.items?.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')) ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function createMessage() {
    if (!content.trim()) return;
    const created = await client.models.Message.create({ content: content.trim() });

    // optional: upload a file tied to the user
    if (file) {
      await client.storage.put({
        path: `media/{entity_id}/${Date.now()}-${file.name}`,
        data: file,
      });
      setFile(null);
    }
    setContent('');
    await refresh();
  }

  async function deleteMessage(id) {
    await client.models.Message.delete({ id });
    await refresh();
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <View padding="1rem">
          <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
            <Text>Signed in as {user?.signInDetails?.loginId}</Text>
            <Button onClick={signOut}>Sign out</Button>
          </Flex>

          <Flex gap="0.5rem" wrap="wrap" alignItems="center">
            <TextField
              label="Say something"
              labelHidden
              placeholder="Hello, Amplify!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              width="20rem"
            />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Button onClick={createMessage}>Create</Button>
          </Flex>

          <View as="hr" margin="1rem 0" />
          {messages.map(m => (
            <Flex key={m.id} alignItems="center" justifyContent="space-between" style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
              <Text>{m.content}</Text>
              <Button variation="link" onClick={() => deleteMessage(m.id)}>Delete</Button>
            </Flex>
          ))}
        </View>
      )}
    </Authenticator>
  );
}
