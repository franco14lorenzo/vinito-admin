/* eslint-disable @typescript-eslint/no-unused-vars */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          address: string
          created_at: string
          created_by: number | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          qr_code: string
          status: Database['public']['Enums']['accommodation_status']
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          address: string
          created_at?: string
          created_by?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          qr_code: string
          status?: Database['public']['Enums']['accommodation_status']
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          created_by?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          qr_code?: string
          status?: Database['public']['Enums']['accommodation_status']
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'accommodations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accommodations_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      admin: {
        Row: {
          created_at: string
          created_by: number | null
          email: string
          id: number
          name: string
          surname: string
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          email: string
          id?: never
          name: string
          surname: string
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          email?: string
          id?: never
          name?: string
          surname?: string
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          phone: string | null
          status: Database['public']['Enums']['contact_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          phone?: string | null
          status?: Database['public']['Enums']['contact_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          phone?: string | null
          status?: Database['public']['Enums']['contact_status']
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          created_by: number | null
          email: string
          id: string
          name: string
          phone: string
          surname: string
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          email: string
          id?: string
          name: string
          phone: string
          surname: string
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          email?: string
          id?: string
          name?: string
          phone?: string
          surname?: string
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'customers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'customers_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      delivery_schedules: {
        Row: {
          created_at: string
          created_by: number | null
          end_time: string
          id: number
          name: string
          start_time: string
          status: Database['public']['Enums']['delivery_schedule_status']
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          end_time: string
          id?: number
          name: string
          start_time: string
          status?: Database['public']['Enums']['delivery_schedule_status']
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          end_time?: string
          id?: number
          name?: string
          start_time?: string
          status?: Database['public']['Enums']['delivery_schedule_status']
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'delivery_schedules_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'delivery_schedules_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          created_by: number | null
          id: number
          order: number
          question: string
          status: Database['public']['Enums']['faq_status']
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          answer: string
          created_at?: string
          created_by?: number | null
          id?: number
          order?: number
          question: string
          status?: Database['public']['Enums']['faq_status']
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          answer?: string
          created_at?: string
          created_by?: number | null
          id?: number
          order?: number
          question?: string
          status?: Database['public']['Enums']['faq_status']
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'faqs_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'faqs_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      order_tastings: {
        Row: {
          order_id: string
          quantity: number
          tasting_id: number
        }
        Insert: {
          order_id: string
          quantity: number
          tasting_id: number
        }
        Update: {
          order_id?: string
          quantity?: number
          tasting_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_tastings_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_tastings_tasting_id_fkey'
            columns: ['tasting_id']
            isOneToOne: false
            referencedRelation: 'tastings'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          accommodation_id: string | null
          created_at: string
          created_by: number | null
          customer_id: string
          customer_note: string | null
          delivery_date: string
          delivery_schedule_id: number
          discount_amount: number | null
          id: string
          payment_id: number | null
          shipping_amount: number | null
          status: Database['public']['Enums']['order_state']
          tax_amount: number | null
          total_amount: number
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string
          created_by?: number | null
          customer_id: string
          customer_note?: string | null
          delivery_date: string
          delivery_schedule_id: number
          discount_amount?: number | null
          id?: string
          payment_id?: number | null
          shipping_amount?: number | null
          status?: Database['public']['Enums']['order_state']
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string
          created_by?: number | null
          customer_id?: string
          customer_note?: string | null
          delivery_date?: string
          delivery_schedule_id?: number
          discount_amount?: number | null
          id?: string
          payment_id?: number | null
          shipping_amount?: number | null
          status?: Database['public']['Enums']['order_state']
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'orders_accommodation_id_fkey'
            columns: ['accommodation_id']
            isOneToOne: false
            referencedRelation: 'accommodations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_delivery_schedule_id_fkey'
            columns: ['delivery_schedule_id']
            isOneToOne: false
            referencedRelation: 'delivery_schedules'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: false
            referencedRelation: 'payments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          created_by: number | null
          description: string | null
          id: number
          name: string
          status: Database['public']['Enums']['payment_methods_status']
          type: Database['public']['Enums']['payment_type'] | null
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: number
          name: string
          status?: Database['public']['Enums']['payment_methods_status']
          type?: Database['public']['Enums']['payment_type'] | null
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: number
          name?: string
          status?: Database['public']['Enums']['payment_methods_status']
          type?: Database['public']['Enums']['payment_type'] | null
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payment_methods_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_methods_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: number | null
          id: number
          order_id: string
          payment_method_id: number
          status: Database['public']['Enums']['payment_status']
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: number | null
          id?: number
          order_id: string
          payment_method_id: number
          status: Database['public']['Enums']['payment_status']
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: number | null
          id?: number
          order_id?: string
          payment_method_id?: number
          status?: Database['public']['Enums']['payment_status']
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payments_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_payment_method_id_fkey'
            columns: ['payment_method_id']
            isOneToOne: false
            referencedRelation: 'payment_methods'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: number
          key: string
          updated_at: string
          updated_by: number | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: number
          key: string
          updated_at?: string
          updated_by?: number | null
          value: string
        }
        Update: {
          description?: string | null
          id?: number
          key?: string
          updated_at?: string
          updated_by?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'settings_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      tasting_wines: {
        Row: {
          tasting_id: number
          wine_id: number
        }
        Insert: {
          tasting_id: number
          wine_id: number
        }
        Update: {
          tasting_id?: number
          wine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'tasting_wines_tasting_id_fkey'
            columns: ['tasting_id']
            isOneToOne: false
            referencedRelation: 'tastings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasting_wines_wine_id_fkey'
            columns: ['wine_id']
            isOneToOne: false
            referencedRelation: 'wines'
            referencedColumns: ['id']
          }
        ]
      }
      tastings: {
        Row: {
          created_at: string
          created_by: number | null
          id: number
          image: string | null
          long_description: string | null
          name: string
          pairings: string | null
          price: number
          short_description: string | null
          slug: string
          sold: number | null
          status: Database['public']['Enums']['tasting_status']
          stock: number
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by?: number | null
          id?: never
          image?: string | null
          long_description?: string | null
          name: string
          pairings?: string | null
          price: number
          short_description?: string | null
          slug: string
          sold?: number | null
          status?: Database['public']['Enums']['tasting_status']
          stock?: number
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number | null
          id?: never
          image?: string | null
          long_description?: string | null
          name?: string
          pairings?: string | null
          price?: number
          short_description?: string | null
          slug?: string
          sold?: number | null
          status?: Database['public']['Enums']['tasting_status']
          stock?: number
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'tastings_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
      wines: {
        Row: {
          cost_usd_blue: number
          created_at: string
          created_by: number | null
          description: string | null
          id: number
          image: string | null
          name: string
          price: number
          sold: number | null
          status: Database['public']['Enums']['wine_status']
          stock: number | null
          updated_at: string
          updated_by: number | null
          variety: string
          volume_ml: number
          winery: string
          year: number
        }
        Insert: {
          cost_usd_blue: number
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: never
          image?: string | null
          name: string
          price: number
          sold?: number | null
          status?: Database['public']['Enums']['wine_status']
          stock?: number | null
          updated_at?: string
          updated_by?: number | null
          variety: string
          volume_ml: number
          winery: string
          year: number
        }
        Update: {
          cost_usd_blue?: number
          created_at?: string
          created_by?: number | null
          description?: string | null
          id?: never
          image?: string | null
          name?: string
          price?: number
          sold?: number | null
          status?: Database['public']['Enums']['wine_status']
          stock?: number | null
          updated_at?: string
          updated_by?: number | null
          variety?: string
          volume_ml?: number
          winery?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'wines_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: {
          customer: Json
          customer_note: string
          accommodation_id: string
          delivery_date: string
          delivery_schedule_id: number
          payment_method_id: number
          total_amount: number
          items: Json
        }
        Returns: {
          order_id: string
          payment_id: number
        }[]
      }
    }
    Enums: {
      accommodation_status: 'draft' | 'active' | 'inactive' | 'deleted'
      contact_status: 'unread' | 'read' | 'answered' | 'deleted'
      delivery_schedule_status: 'draft' | 'active' | 'inactive' | 'deleted'
      faq_status: 'draft' | 'active' | 'inactive' | 'deleted'
      order_state:
        | 'pending'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
      payment_methods_status: 'draft' | 'active' | 'inactive' | 'deleted'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      payment_type: 'cash_on_delivery' | 'bank_transfer'
      tasting_status: 'draft' | 'active' | 'inactive' | 'deleted'
      wine_status: 'draft' | 'active' | 'inactive' | 'deleted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
      PublicSchema['Views'])
  ? (PublicSchema['Tables'] &
      PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
  ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never
