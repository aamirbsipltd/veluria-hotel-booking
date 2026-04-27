import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { format, differenceInDays } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    color: '#1f2937',
  },
  header: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerBrand: {
    color: '#c7d2fe',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRef: {
    textAlign: 'right',
  },
  headerRefLabel: {
    color: '#c7d2fe',
    fontSize: 8,
    marginBottom: 3,
  },
  headerRefValue: {
    color: '#ffffff',
    fontFamily: 'Courier',
    fontSize: 11,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowLabel: {
    color: '#6b7280',
  },
  rowValue: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'dashed',
    marginVertical: 12,
  },
  footer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
  },
});

export interface VoucherData {
  partnerOrderId: string;
  hotelName: string;
  checkin: Date;
  checkout: Date;
  leadGuestFirst: string;
  leadGuestLast: string;
  leadGuestEmail: string;
  totalAmount: string;
  currencyCode: string;
  freeCancelBefore: Date | null;
}

export function VoucherDocument({ data }: { data: VoucherData }) {
  const nights = differenceInDays(data.checkout, data.checkin);
  const ref = data.partnerOrderId.slice(0, 8).toUpperCase();

  let cancellationText = 'Non-refundable';
  if (data.freeCancelBefore && data.freeCancelBefore > new Date()) {
    cancellationText = `Free cancellation until ${format(data.freeCancelBefore, 'MMM d, yyyy')}`;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerBrand}>Veluria</Text>
            <Text style={styles.headerTitle}>Booking Confirmation</Text>
          </View>
          <View style={styles.headerRef}>
            <Text style={styles.headerRefLabel}>BOOKING REF</Text>
            <Text style={styles.headerRefValue}>{ref}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hotel</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Property</Text>
            <Text style={styles.rowValue}>{data.hotelName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check-in</Text>
            <Text style={styles.rowValue}>{format(data.checkin, 'EEE, MMM d yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Check-out</Text>
            <Text style={styles.rowValue}>{format(data.checkout, 'EEE, MMM d yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Duration</Text>
            <Text style={styles.rowValue}>{nights} night{nights > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{data.leadGuestFirst} {data.leadGuestLast}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{data.leadGuestEmail}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total</Text>
            <Text style={styles.rowValue}>{data.currencyCode} {data.totalAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment method</Text>
            <Text style={styles.rowValue}>Pay at hotel</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cancellation</Text>
            <Text style={styles.rowValue}>{cancellationText}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Present this confirmation at check-in · veluria.com
        </Text>
      </Page>
    </Document>
  );
}
