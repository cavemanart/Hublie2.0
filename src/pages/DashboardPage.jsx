import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';

export default function Dashboard({ userName = "Guest", householdName = "Your Household" }) {
  const [notes, setNotes] = useState([
    { id: '1', title: 'Groceries', content: 'Milk, Bread, Eggs', author: 'Mom', target: 'All' },
    { id: '2', title: 'Reminder', content: 'Walk the dog', author: 'Dad', target: 'Kid' },
  ]);
  const [newNote, setNewNote] = useState('');
  const [bills] = useState([
    { id: '1', name: 'Rent', amount: '$1200', due: '2025-06-01' },
    { id: '2', name: 'Electric', amount: '$80', due: '2025-06-05' },
  ]);
  const [chores] = useState([
    { id: '1', name: 'Take out trash', due: 'Tonight' },
    { id: '2', name: 'Clean bathroom', due: 'Saturday' },
  ]);

  const addNote = () => {
    if (newNote.trim() !== '') {
      const newEntry = {
        id: Date.now().toString(),
        title: 'New Note',
        content: newNote,
        author: 'You',
        target: 'All',
      };
      setNotes([newEntry, ...notes]);
      setNewNote('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Welcome, {userName}!</Text>
      <Text style={styles.subheading}>Household: {householdName}</Text>

      {/* Shared Notes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shared Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Write a new note..."
          value={newNote}
          onChangeText={setNewNote}
        />
        <TouchableOpacity onPress={addNote} style={styles.button}>
          <Text style={styles.buttonText}>Add Note</Text>
        </TouchableOpacity>
        {notes.map((note) => (
          <View key={note.id} style={styles.card}>
            <Text style={styles.cardTitle}>{note.title}</Text>
            <Text>{note.content}</Text>
            <Text style={styles.meta}>From: {note.author} | To: {note.target}</Text>
          </View>
        ))}
      </View>

      {/* Bills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bills</Text>
        {bills.map((bill) => (
          <View key={bill.id} style={styles.card}>
            <Text style={styles.cardTitle}>{bill.name}</Text>
            <Text>Amount: {bill.amount}</Text>
            <Text>Due: {bill.due}</Text>
          </View>
        ))}
      </View>

      {/* Chores Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chores</Text>
        {chores.map((chore) => (
          <View key={chore.id} style={styles.card}>
            <Text style={styles.cardTitle}>{chore.name}</Text>
            <Text>Due: {chore.due}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subheading: { fontSize: 16, color: '#666', marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  card: { backgroundColor: '#f1f1f1', padding: 12, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 12, color: '#888', marginTop: 4 },
  input: { backgroundColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
