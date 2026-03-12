import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;

const chartConfig = {
  backgroundColor: Colors.card,
  backgroundGradientFrom: Colors.card,
  backgroundGradientTo: Colors.card,
  color: (opacity = 1) => `rgba(212, 132, 90, ${opacity})`,
  labelColor: () => Colors.textLight,
  propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
  decimalPlaces: 0,
  barPercentage: 0.6,
  style: { borderRadius: 16 },
};

export default function DataScreen() {
  const { t, logs } = useApp();

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!logs.length) return null;

    // By hour
    const hourCounts = Array(24).fill(0);
    logs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour]++;
    });

    // By body part
    const bodyParts = {};
    logs.forEach((log) => {
      if (log.bodyPart) {
        bodyParts[log.bodyPart] = (bodyParts[log.bodyPart] || 0) + 1;
      }
    });

    // By location
    const locations = {};
    logs.forEach((log) => {
      if (log.location) {
        locations[log.location] = (locations[log.location] || 0) + 1;
      }
    });

    // By trigger
    const triggers = {};
    logs.forEach((log) => {
      if (log.trigger) {
        triggers[log.trigger] = (triggers[log.trigger] || 0) + 1;
      }
    });

    // This week / month counts
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = logs.filter((l) => new Date(l.timestamp) >= weekAgo).length;
    const thisMonth = logs.filter((l) => new Date(l.timestamp) >= monthAgo).length;

    // Feel scale over time (last 14 logs)
    const recentLogs = logs.slice(0, 14).reverse();
    const feelData = recentLogs.map((l) => l.feelScale ?? 5);

    return {
      hourCounts,
      bodyParts,
      locations,
      triggers,
      thisWeek,
      thisMonth,
      feelData,
      recentLogs,
    };
  }, [logs]);

  const renderTopItems = (obj, title) => {
    const sorted = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!sorted.length) return null;
    const max = sorted[0][1];
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sorted.map(([key, count]) => (
          <View key={key} style={styles.barItem}>
            <Text style={styles.barLabel}>{key}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(count / max) * 100}%` }]} />
            </View>
            <Text style={styles.barCount}>{count}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{t('dataTitle')}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>
            Aún no hay datos. Haz tu primer registro para ver tu análisis aquí.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare hour chart data (show every 3 hours for readability)
  const hourLabels = ['0', '3', '6', '9', '12', '15', '18', '21'];
  const hourData = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => analytics.hourCounts[h]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('dataTitle')}</Text>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{logs.length}</Text>
            <Text style={styles.summaryLabel}>{t('dataTotalLogs')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{analytics.thisWeek}</Text>
            <Text style={styles.summaryLabel}>{t('dataThisWeek')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{analytics.thisMonth}</Text>
            <Text style={styles.summaryLabel}>{t('dataThisMonth')}</Text>
          </View>
        </View>

        {/* Feel trend */}
        {analytics.feelData.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('howDoYouFeel')} — tendencia</Text>
            <LineChart
              data={{
                labels: analytics.recentLogs.map((_, i) => (i % 3 === 0 ? `${i + 1}` : '')),
                datasets: [{ data: analytics.feelData }],
              }}
              width={CHART_WIDTH}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
            />
          </View>
        )}

        {/* By hour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dataByHour')}</Text>
          <BarChart
            data={{
              labels: hourLabels,
              datasets: [{ data: hourData }],
            }}
            width={CHART_WIDTH}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={false}
            showValuesOnTopOfBars
          />
        </View>

        {/* Body parts */}
        {renderTopItems(analytics.bodyParts, t('dataByBodyPart'))}

        {/* Locations */}
        {renderTopItems(analytics.locations, t('dataByLocation'))}

        {/* Triggers */}
        {renderTopItems(analytics.triggers, t('dataByTrigger'))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    width: 90,
    fontSize: 14,
    color: Colors.text,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.surface,
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  barCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'right',
  },
});
