import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, SafeAreaView } from 'react-format-native';
import { View as RNView, Text as RNText, StyleSheet as RNStyleSheet, RefreshControl as RNRefreshControl } from 'react-native';
import { supabase } from '@skillbridge/shared';

// Explicit alignment with the global Database table parameters
interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

const styles = RNStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  todoItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  todoItemCompleted: {
    borderLeftColor: '#10b981',
    opacity: 0.8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  todoDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default function HomeScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch operation to prevent cycle reference re-trigger loops
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Safety gate check for valid user contextual session parameters
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No active user context found');

      const { data, error } = await supabase
        .from('todos')
        .select('id, user_id, title, description, completed, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos((data as TodoItem[]) || []);
    } catch (error) {
      console.error('SkillBridge Mobile Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <RNView style={styles.container}>
      <RNView style={styles.header}>
        <RNText style={styles.headerTitle}>Task Workspace</RNText>
        <RNText style={styles.headerSubtitle}>Manage your current technical track progress</RNText>
      </RNView>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <RNView style={[styles.todoItem, item.completed && styles.todoItemCompleted]}>
            <RNText style={[styles.todoTitle, item.completed && styles.todoTitleCompleted]}>
              {item.title}
            </RNText>
            {item.description ? (
              <RNText style={styles.todoDescription}>{item.description}</RNText>
            ) : null}
            <RNView style={[
              styles.statusBadge, 
              { backgroundColor: item.completed ? '#dcfce7' : '#fef3c7' }
            ]}>
              <RNText style={[
                styles.statusText, 
                { color: item.completed ? '#166534' : '#92400e' }
              ]}>
                {item.completed ? '✓ Completed' : 'In Progress'}
              </RNText>
            </RNView>
          </RNView>
        )}
        ListEmptyComponent={
          <RNView style={styles.emptyCard}>
            <RNText style={styles.emptyText}>No tasks documented yet</RNText>
            <RNText style={styles.emptySubtext}>Your technical workspace track is completely clear.</RNText>
          </RNView>
        }
        refreshControl={
          <RNRefreshControl 
            refreshing={loading} 
            onRefresh={fetchTodos} 
            colors={['#2563eb']} 
            tintColor="#2563eb"
          />
        }
      />
    </RNView>
  );
}
