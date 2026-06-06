export async function createShipment({ orderId, pickup, dropoff }: { orderId: string; pickup: any; dropoff: any }) {
  // TODO: implement provider-specific API call (InDrive, DHL, etc.)
  // Use DELIVERY_API_KEY from environment variables.
  console.log('Creating shipment for order', orderId)
  return {
    provider: 'mock',
    shipmentId: `mock-${orderId}`,
    trackingUrl: null,
    status: 'created',
  }
}

export async function getShipmentStatus(shipmentId: string) {
  // TODO: call provider API to fetch latest status
  console.log('Fetching shipment status for', shipmentId)
  return { shipmentId, status: 'in_transit', updatedAt: new Date().toISOString() }
}
