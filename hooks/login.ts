import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";
import { User } from "@supabase/supabase-js";

export function useLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        if (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL) {
          await supabase.auth.signOut();
          setUser(null);
          setMessage("このアカウントにはアクセス権限がありません。");
        } else {
          setUser(session.user);
          setMessage("");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        if (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL) {
          await supabase.auth.signOut();
          setUser(null);
          setMessage("このアカウントにはアクセス権限がありません。");
        } else {
          setUser(session.user);
          setMessage("");
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, ADMIN_EMAIL]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/settings`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error);
      setMessage("ログインに失敗しました。");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setMessage("ログアウトしました。");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    message,
    handleLogin,
    handleLogout
  };
}
