import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@skillbridge/shared';

// Explicit alignment with the global Course Progression parameters
interface ProgressionItem {
  id: string;
  user_id: string;
  course_id: string;
  sessions_attended: number;
  total_sessions: number;
  assessments_completed: number;
  total_assessments: number;
  is_certified: boolean;
  updated_at: string;
  course_catalog?: {
    title: string;
    category: string;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardCertified: {
    borderLeftColor: '#10b981',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  taskCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metricBlock: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  refreshButton: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 10,
    margin: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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

export default function DashboardScreen() {
  const [progression, setProgression] = useState<ProgressionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized fetch tasks using the exact schema definitions we created
  const fetchAcademicProgression = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No valid user token context');

      const { data, error } = await supabase
        .from('course_progression')
        .select(`
          id,
          user_id,
          course_id,
          sessions_attended,
          total_sessions,
          assessments_completed,
          total_assessments,
          is_certified,
          updated_at,
          course_catalog (
            title,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProgression((data as any) || []);
    } catch (error) {
      console.error('SkillBridge Mobile Dashboard Fetch Failure:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicProgression();
  }, [fetchAcademicProgression]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAcademicProgression();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={progression}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const attendancePercent = Math.round((item.sessions_attended / item.total_sessions) * 100);
          return (
            <View style={[styles.taskCard, item.is_certified && styles.taskCardCertified]}>
              <Text style={styles.taskTitle}>{item.course_catalog?.title || 'Academy Curriculum Track'}</Text>
              <Text style={styles.taskCategory}>{item.course_catalog?.category || 'Syllabus Block'}</Text>
              
              <View style={styles.metricsRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Attendance</Text>
                  <Text style={styles.metricValue}>{item.sessions_attended}/{item.total_sessions} ({attendancePercent}%)</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Portfolios</Text>
                  <Text style={styles.metricValue}>{item.assessments_completed}/{item.total_assessments}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.is_certified ? '#dcfce7' : '#fef3c7' },
                ]}
              >
                <Text style={[styles.statusText, { color: item.is_certified ? '#166534' : '#92400e' }]}>
                  {item.is_certified ? '🏆 Certified Graduate' : '⏳ Course In Progress'}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active courses yet</Text>
            <Text style={styles.emptySubtext}>Enroll in a curriculum path from the web app to view parameters here.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
        }
      />
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Sync Academic Progress</Text>
      </TouchableOpacity>
    </View>
  );
}
