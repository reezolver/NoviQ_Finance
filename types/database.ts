export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anamneses: {
        Row: {
          analise: Json | null
          consentimento_at: string | null
          created_at: string
          email_lead: string | null
          gestor_id: string
          id: string
          nome_lead: string
          preenchida_at: string | null
          respostas: Json
          status: Database["public"]["Enums"]["status_anamnese"]
          subconta_id: string | null
          token: string
        }
        Insert: {
          analise?: Json | null
          consentimento_at?: string | null
          created_at?: string
          email_lead?: string | null
          gestor_id: string
          id?: string
          nome_lead: string
          preenchida_at?: string | null
          respostas?: Json
          status?: Database["public"]["Enums"]["status_anamnese"]
          subconta_id?: string | null
          token: string
        }
        Update: {
          analise?: Json | null
          consentimento_at?: string | null
          created_at?: string
          email_lead?: string | null
          gestor_id?: string
          id?: string
          nome_lead?: string
          preenchida_at?: string | null
          respostas?: Json
          status?: Database["public"]["Enums"]["status_anamnese"]
          subconta_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          grupo: Database["public"]["Enums"]["grupo_categoria"]
          id: string
          is_default: boolean
          nome: string
          ordem: number
          subconta_id: string
        }
        Insert: {
          grupo: Database["public"]["Enums"]["grupo_categoria"]
          id?: string
          is_default?: boolean
          nome: string
          ordem?: number
          subconta_id: string
        }
        Update: {
          grupo?: Database["public"]["Enums"]["grupo_categoria"]
          id?: string
          is_default?: boolean
          nome?: string
          ordem?: number
          subconta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      dividas: {
        Row: {
          id: string
          parcelas_restantes: number
          score_faixa: string | null
          subconta_id: string
          taxa: number
          tipo: string
          valor_parcela: number
          valor_total: number
        }
        Insert: {
          id?: string
          parcelas_restantes?: number
          score_faixa?: string | null
          subconta_id: string
          taxa?: number
          tipo: string
          valor_parcela?: number
          valor_total?: number
        }
        Update: {
          id?: string
          parcelas_restantes?: number
          score_faixa?: string | null
          subconta_id?: string
          taxa?: number
          tipo?: string
          valor_parcela?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          categoria_id: string | null
          created_at: string
          created_by_user_id: string
          data: string
          descricao: string | null
          id: string
          objetivo_id: string | null
          observacao: string | null
          subconta_id: string
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          created_by_user_id?: string
          data?: string
          descricao?: string | null
          id?: string
          objetivo_id?: string | null
          observacao?: string | null
          subconta_id: string
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          created_by_user_id?: string
          data?: string
          descricao?: string | null
          id?: string
          objetivo_id?: string | null
          observacao?: string | null
          subconta_id?: string
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      objetivos: {
        Row: {
          created_at: string
          data_limite: string
          id: string
          nome: string
          subconta_id: string
          valor_alvo: number
          valor_inicial: number
        }
        Insert: {
          created_at?: string
          data_limite: string
          id?: string
          nome: string
          subconta_id: string
          valor_alvo: number
          valor_inicial?: number
        }
        Update: {
          created_at?: string
          data_limite?: string
          id?: string
          nome?: string
          subconta_id?: string
          valor_alvo?: number
          valor_inicial?: number
        }
        Relationships: [
          {
            foreignKeyName: "objetivos_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          ano: number | null
          categoria_id: string
          created_at: string
          id: string
          mes: number | null
          subconta_id: string
          valor_planejado: number
        }
        Insert: {
          ano?: number | null
          categoria_id: string
          created_at?: string
          id?: string
          mes?: number | null
          subconta_id: string
          valor_planejado: number
        }
        Update: {
          ano?: number | null
          categoria_id?: string
          created_at?: string
          id?: string
          mes?: number | null
          subconta_id?: string
          valor_planejado?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio: {
        Row: {
          categoria_investimento:
            | Database["public"]["Enums"]["categoria_investimento"]
            | null
          descricao: string | null
          finalidade:
            | Database["public"]["Enums"]["finalidade_patrimonio"]
            | null
          id: string
          rentabilidade: number
          subconta_id: string
          tipo: Database["public"]["Enums"]["tipo_patrimonio"]
          valor: number
        }
        Insert: {
          categoria_investimento?:
            | Database["public"]["Enums"]["categoria_investimento"]
            | null
          descricao?: string | null
          finalidade?:
            | Database["public"]["Enums"]["finalidade_patrimonio"]
            | null
          id?: string
          rentabilidade?: number
          subconta_id: string
          tipo: Database["public"]["Enums"]["tipo_patrimonio"]
          valor?: number
        }
        Update: {
          categoria_investimento?:
            | Database["public"]["Enums"]["categoria_investimento"]
            | null
          descricao?: string | null
          finalidade?:
            | Database["public"]["Enums"]["finalidade_patrimonio"]
            | null
          id?: string
          rentabilidade?: number
          subconta_id?: string
          tipo?: Database["public"]["Enums"]["tipo_patrimonio"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_subconta_id_fkey"
            columns: ["subconta_id"]
            isOneToOne: false
            referencedRelation: "subcontas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          nome: string | null
          preferencia_inicial: string | null
          status: Database["public"]["Enums"]["status_perfil"]
          tipo_perfil: Database["public"]["Enums"]["tipo_perfil"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          preferencia_inicial?: string | null
          status?: Database["public"]["Enums"]["status_perfil"]
          tipo_perfil?: Database["public"]["Enums"]["tipo_perfil"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          preferencia_inicial?: string | null
          status?: Database["public"]["Enums"]["status_perfil"]
          tipo_perfil?: Database["public"]["Enums"]["tipo_perfil"]
        }
        Relationships: []
      }
      subcontas: {
        Row: {
          created_at: string
          deleted_at: string | null
          gestor_id: string | null
          id: string
          nome: string
          origem_anamnese_id: string | null
          owner_user_id: string | null
          tipo: Database["public"]["Enums"]["tipo_subconta"]
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          gestor_id?: string | null
          id?: string
          nome: string
          origem_anamnese_id?: string | null
          owner_user_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_subconta"]
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          gestor_id?: string | null
          id?: string
          nome?: string
          origem_anamnese_id?: string | null
          owner_user_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_subconta"]
        }
        Relationships: [
          {
            foreignKeyName: "subcontas_origem_anamnese_fk"
            columns: ["origem_anamnese_id"]
            isOneToOne: false
            referencedRelation: "anamneses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_subconta: { Args: { p_subconta: string }; Returns: boolean }
      is_master: { Args: never; Returns: boolean }
    }
    Enums: {
      categoria_investimento: "renda_fixa" | "renda_variavel" | "multimercado"
      finalidade_patrimonio: "reserva" | "patrimonio"
      grupo_categoria: "renda" | "fixa" | "variavel" | "investimento"
      status_anamnese: "enviada" | "preenchida"
      status_perfil: "ativo" | "pendente" | "inativo"
      tipo_lancamento: "despesa" | "receita" | "objetivo"
      tipo_patrimonio: "imovel" | "veiculo" | "investimento"
      tipo_perfil: "master" | "educador" | "cliente"
      tipo_subconta: "pessoal" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_investimento: ["renda_fixa", "renda_variavel", "multimercado"],
      finalidade_patrimonio: ["reserva", "patrimonio"],
      grupo_categoria: ["renda", "fixa", "variavel", "investimento"],
      status_anamnese: ["enviada", "preenchida"],
      status_perfil: ["ativo", "pendente", "inativo"],
      tipo_lancamento: ["despesa", "receita", "objetivo"],
      tipo_patrimonio: ["imovel", "veiculo", "investimento"],
      tipo_perfil: ["master", "educador", "cliente"],
      tipo_subconta: ["pessoal", "cliente"],
    },
  },
} as const
