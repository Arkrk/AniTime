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
    // URLのエラーパラメータをチェック
    const checkErrorFromUrl = () => {
      const hash = window.location.hash;
      if (hash && hash.includes("error_description")) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get("error_description");
        if (errorDesc) {
          const decode = decodeURIComponent(errorDesc).replace(/\+/g, " ");
          if (decode.includes("Database error saving new user") || decode.includes("アクセス権限")) {
            setMessage("このアカウントにはアクセス権限がありません。");
          } else {
            setMessage(decode);
          }
        }
      }
    };

    const checkUser = async () => {
      checkErrorFromUrl();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (session?.user) {
        if (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error(e);
          }
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

    // 初期化時に一度だけ実行
    checkUser();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        if (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error(e);
          }
          setUser(null);
          setMessage("このアカウントにはアクセス権限がありません。");
        } else {
          setUser(session.user);
          setMessage("");
        }
      } else if (event === "SIGNED_OUT") {
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
