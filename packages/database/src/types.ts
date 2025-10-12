export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null;
          accessTokenExpiresAt: string | null;
          accountId: string;
          createdAt: string;
          id: string;
          idToken: string | null;
          password: string | null;
          providerId: string;
          refreshToken: string | null;
          refreshTokenExpiresAt: string | null;
          scope: string | null;
          updatedAt: string;
          userId: string;
        };
        Insert: {
          accessToken?: string | null;
          accessTokenExpiresAt?: string | null;
          accountId: string;
          createdAt?: string;
          id: string;
          idToken?: string | null;
          password?: string | null;
          providerId: string;
          refreshToken?: string | null;
          refreshTokenExpiresAt?: string | null;
          scope?: string | null;
          updatedAt: string;
          userId: string;
        };
        Update: {
          accessToken?: string | null;
          accessTokenExpiresAt?: string | null;
          accountId?: string;
          createdAt?: string;
          id?: string;
          idToken?: string | null;
          password?: string | null;
          providerId?: string;
          refreshToken?: string | null;
          refreshTokenExpiresAt?: string | null;
          scope?: string | null;
          updatedAt?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      app_permissions: {
        Row: {
          app: Database["public"]["Enums"]["app_name"];
          createdAt: string | null;
          id: string;
          memberId: string;
          permission: Database["public"]["Enums"]["app_permission_level"];
          updatedAt: string | null;
        };
        Insert: {
          app: Database["public"]["Enums"]["app_name"];
          createdAt?: string | null;
          id?: string;
          memberId: string;
          permission?: Database["public"]["Enums"]["app_permission_level"];
          updatedAt?: string | null;
        };
        Update: {
          app?: Database["public"]["Enums"]["app_name"];
          createdAt?: string | null;
          id?: string;
          memberId?: string;
          permission?: Database["public"]["Enums"]["app_permission_level"];
          updatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_permissions_memberId_fkey";
            columns: ["memberId"];
            isOneToOne: false;
            referencedRelation: "member";
            referencedColumns: ["id"];
          },
        ];
      };
      invitation: {
        Row: {
          email: string;
          expiresAt: string;
          id: string;
          inviterId: string;
          organizationId: string;
          role: string | null;
          status: string;
        };
        Insert: {
          email: string;
          expiresAt: string;
          id: string;
          inviterId: string;
          organizationId: string;
          role?: string | null;
          status: string;
        };
        Update: {
          email?: string;
          expiresAt?: string;
          id?: string;
          inviterId?: string;
          organizationId?: string;
          role?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitation_inviterId_fkey";
            columns: ["inviterId"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitation_organizationId_fkey";
            columns: ["organizationId"];
            isOneToOne: false;
            referencedRelation: "organization";
            referencedColumns: ["id"];
          },
        ];
      };
      member: {
        Row: {
          createdAt: string;
          id: string;
          organizationId: string;
          role: string;
          userId: string;
        };
        Insert: {
          createdAt: string;
          id: string;
          organizationId: string;
          role: string;
          userId: string;
        };
        Update: {
          createdAt?: string;
          id?: string;
          organizationId?: string;
          role?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "member_organizationId_fkey";
            columns: ["organizationId"];
            isOneToOne: false;
            referencedRelation: "organization";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "member_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      organization: {
        Row: {
          allowedDomains: string[] | null;
          autoJoinEnabled: boolean | null;
          createdAt: string;
          id: string;
          logo: string | null;
          metadata: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          allowedDomains?: string[] | null;
          autoJoinEnabled?: boolean | null;
          createdAt: string;
          id: string;
          logo?: string | null;
          metadata?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          allowedDomains?: string[] | null;
          autoJoinEnabled?: boolean | null;
          createdAt?: string;
          id?: string;
          logo?: string | null;
          metadata?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      session: {
        Row: {
          activeOrganizationId: string | null;
          createdAt: string;
          expiresAt: string;
          id: string;
          impersonatedBy: string | null;
          ipAddress: string | null;
          token: string;
          updatedAt: string;
          userAgent: string | null;
          userId: string;
        };
        Insert: {
          activeOrganizationId?: string | null;
          createdAt?: string;
          expiresAt: string;
          id: string;
          impersonatedBy?: string | null;
          ipAddress?: string | null;
          token: string;
          updatedAt: string;
          userAgent?: string | null;
          userId: string;
        };
        Update: {
          activeOrganizationId?: string | null;
          createdAt?: string;
          expiresAt?: string;
          id?: string;
          impersonatedBy?: string | null;
          ipAddress?: string | null;
          token?: string;
          updatedAt?: string;
          userAgent?: string | null;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      twoFactor: {
        Row: {
          backupCodes: string;
          id: string;
          secret: string;
          userId: string;
        };
        Insert: {
          backupCodes: string;
          id: string;
          secret: string;
          userId: string;
        };
        Update: {
          backupCodes?: string;
          id?: string;
          secret?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "twoFactor_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user: {
        Row: {
          banExpires: string | null;
          banned: boolean | null;
          banReason: string | null;
          createdAt: string;
          email: string;
          emailVerified: boolean;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string;
          role: string | null;
          twoFactorEnabled: boolean | null;
          updatedAt: string;
        };
        Insert: {
          banExpires?: string | null;
          banned?: boolean | null;
          banReason?: string | null;
          createdAt?: string;
          email: string;
          emailVerified: boolean;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name: string;
          role?: string | null;
          twoFactorEnabled?: boolean | null;
          updatedAt?: string;
        };
        Update: {
          banExpires?: string | null;
          banned?: boolean | null;
          banReason?: string | null;
          createdAt?: string;
          email?: string;
          emailVerified?: boolean;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string;
          role?: string | null;
          twoFactorEnabled?: boolean | null;
          updatedAt?: string;
        };
        Relationships: [];
      };
      verification: {
        Row: {
          createdAt: string;
          expiresAt: string;
          id: string;
          identifier: string;
          updatedAt: string;
          value: string;
        };
        Insert: {
          createdAt?: string;
          expiresAt: string;
          id: string;
          identifier: string;
          updatedAt?: string;
          value: string;
        };
        Update: {
          createdAt?: string;
          expiresAt?: string;
          id?: string;
          identifier?: string;
          updatedAt?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_permission_value: {
        Args: { perm: Database["public"]["Enums"]["app_permission_level"] };
        Returns: number;
      };
      get_user_app_permission: {
        Args: {
          app_to_check: Database["public"]["Enums"]["app_name"];
          check_org_id: string;
          check_user_id: string;
        };
        Returns: Database["public"]["Enums"]["app_permission_level"];
      };
      user_has_app_permission: {
        Args: {
          app_to_check: Database["public"]["Enums"]["app_name"];
          check_org_id: string;
          check_user_id: string;
          required_permission: Database["public"]["Enums"]["app_permission_level"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_name: "precision" | "momentum";
      app_permission_level: "none" | "read" | "write" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_name: ["precision", "momentum"],
      app_permission_level: ["none", "read", "write", "admin"],
    },
  },
} as const;
