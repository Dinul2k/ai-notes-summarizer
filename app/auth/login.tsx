import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { listenAuth, login, register, logout } from "../../src/features/auth/auth.service";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    return listenAuth((u) => setUserEmail(u?.email ?? null));
  }, []);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your account"),
    [mode]
  );
  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Sign in to continue your mood journey"
        : "A few seconds to get started",
    [mode]
  );

  async function onSubmit() {
    setError(null);
    if (!email.trim()) return setError("Please enter your email");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email");
    if (!pass) return setError("Please enter your password");
    if (mode === "register") {
      if (!confirm) return setError("Please confirm your password");
      if (pass !== confirm) return setError("Passwords do not match");
      if (pass.length < 6) return setError("Use at least 6 characters");
    }

    try {
      setLoading(true);
      if (mode === "login") await login(email.trim(), pass);
      else await register(email.trim(), pass);
    } catch (e: any) {
      const msg =
        e?.code?.replace("auth/", "").replace(/-/g, " ") ||
        e?.message ||
        "Something went wrong";
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally {
      setLoading(false);
    }
  }

  if (userEmail) {
    // Minimal signed-in screen (keeps the same visual language)
    return (
      <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.fill}>
        <View style={styles.topBlobs} />
        <View style={styles.centerWrap}>
          <View style={[styles.card, styles.cardSignedIn]}>
            <View style={{ gap: 8, alignItems: "center" }}>
              <Ionicons name="happy-outline" size={40} color="#1f2937" />
              <Text style={styles.cardTitle}>You’re in</Text>
              <Text style={styles.cardSubtitle}>{userEmail}</Text>
            </View>
            <Pressable
              onPress={logout}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.primaryBtnText}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={["#010101ff", "#9fed3aff"]} style={styles.fill}>
        {/* Decorative blobs */}
        <View style={styles.topBlobs} />
        <View style={styles.centerWrap}>
          {/* Glass card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>

            {/* Form */}
            <View style={{ gap: 12, marginTop: 14 }}>
              <Field
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Field
                icon="lock-closed-outline"
                placeholder="Password"
                value={pass}
                onChangeText={setPass}
                secureTextEntry={!showPass}
                rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPass((s) => !s)}
                autoComplete="password"
              />
              {mode === "register" && (
                <Field
                  icon="shield-checkmark-outline"
                  placeholder="Confirm password"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                  autoComplete="password-new"
                />
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={onSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9 },
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#0b1020" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === "login" ? "Sign in" : "Create account"}
                </Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.muted}>
                {mode === "login" ? "New here?" : "Already have an account?"}
              </Text>
              <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
                <Text style={styles.link}>
                  {mode === "login" ? "Create one" : "Sign in"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

/** ---------- Reusable input with icon ---------- */
function Field({
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: any) {
  return (
    <View style={[styles.inputWrap, style]}>
      <Ionicons name={icon} size={18} color="#64748b" style={{ marginRight: 8 }} />
      <TextInput
        placeholderTextColor="#94a3b8"
        style={styles.input}
        {...props}
      />
      {rightIcon ? (
        <Pressable onPress={onRightIconPress} hitSlop={12} style={{ paddingLeft: 6 }}>
          <Ionicons name={rightIcon} size={18} color="#64748b" />
        </Pressable>
      ) : null}
    </View>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBlobs: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  centerWrap: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    // glass feel
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    backdropFilter: "blur(10px)" as any, // ignored on native but safe
  },
  cardSignedIn: {
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0b1020",
  },
  cardSubtitle: {
    marginTop: 2,
    color: "#1f2937",
    opacity: 0.75,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  input: {
    flex: 1,
    color: "#0b1020",
    fontSize: 16,
    paddingVertical: 10,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  primaryBtnText: {
    fontWeight: "700",
    color: "#0b1020",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  switchRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  link: {
    color: "#0ea5e9",
    fontWeight: "700",
  },
  muted: { color: "#334155" },
  errorText: {
    color: "#b91c1c",
    marginTop: 6,
    marginBottom: -4,
  },
});