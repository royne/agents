export enum OrderStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface Order {
  id: string;
  external_id: string;
  status: OrderStatus;
  order_date?: string;
  payment_method?: string;
  tracking_number?: string;
  shipping_company?: string; // En la BD es shipping_company, pero usamos carrier en el código
  carrier?: string; // Alias para shipping_company para mantener compatibilidad
  order_value: number;
  shipping_cost: number;
  
  // Campos de cliente integrados en la orden
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_email?: string;
  customer_postal_code?: string;
  customer_country?: string;
  
  // Campos adicionales del Excel que ahora están en la BD
  destination_city?: string;     // CIUDAD DESTINO
  destination_state?: string;    // DEPARTAMENTO DESTINO
  shipping_address?: string;     // DIRECCION
  last_movement?: string;        // ÚLTIMO MOVIMIENTO
  last_movement_date?: string;   // FECHA DE ÚLTIMO MOVIMIENTO + HORA
  issue_solved?: boolean;        // FUE SOLUCIONADA LA NOVEDAD
  provider_cost?: number;        // TOTAL EN PRECIOS DE PROVEEDOR
  shipping_type?: string;        // TIPO DE ENVIO
  profit?: number;               // Ganancia calculada (order_value - provider_cost)
  
  campaign_id?: string;
  notes?: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo para mappear los datos del Excel a nuestras entidades
export interface ExcelOrderData {
  [key: string]: any;
  ID?: string | number;
  "NOMBRE CLIENTE"?: string;
  "TELÉFONO"?: string;
  "TELEFONO"?: string;
  "CIUDAD DESTINO"?: string;
  "DEPARTAMENTO DESTINO"?: string;
  "DIRECCION"?: string;
  "ESTATUS"?: string;
  "estado"?: string;
  "ÚLTIMO MOVIMIENTO"?: string;
  "ULTIMO MOVIMIENTO"?: string;
  "FECHA DE ÚLTIMO MOVIMIENTO"?: string;
  "FECHA DE ULTIMO MOVIMIENTO"?: string;
  "NÚMERO GUIA"?: string;
  "NUMERO GUIA"?: string;
  "TRANSPORTADORA"?: string;
  "VALOR DE COMPRA EN PRODUCTOS"?: string | number;
  "PRECIO FLETE"?: string | number;
  "TOTAL EN PRECIOS DE PROVEEDOR"?: string | number;
}

export interface OrderSyncResult {
  created: number;
  updated: number;
  unchanged: number;
  details: Array<{
    id: string;
    action: 'created' | 'updated' | 'unchanged';
  }>;
}
