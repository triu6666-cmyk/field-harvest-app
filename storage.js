const FIELD_APP_STORAGE_KEY = "field-harvest-manager-v1";
const FIELD_APP_UPDATED_KEY = `${FIELD_APP_STORAGE_KEY}:updated-at`;
const FIELD_APP_CLOUD_SETTINGS_KEY = `${FIELD_APP_STORAGE_KEY}:cloud-settings`;
const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let cloudClientPromise = null;

window.fieldHarvestStorage = {
  key: FIELD_APP_STORAGE_KEY,

  load() {
    try {
      const stored = localStorage.getItem(FIELD_APP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  save(value) {
    this.saveLocal(value);
    if (!this.isCloudConfigured()) {
      return Promise.resolve({ skipped: true });
    }

    return this.pushCloud(value);
  },

  saveLocal(value) {
    localStorage.setItem(FIELD_APP_STORAGE_KEY, JSON.stringify(value));
    localStorage.setItem(FIELD_APP_UPDATED_KEY, new Date().toISOString());
  },

  localUpdatedAt() {
    return localStorage.getItem(FIELD_APP_UPDATED_KEY) || "";
  },

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem(FIELD_APP_CLOUD_SETTINGS_KEY) || "{}");
      return {
        url: settings.url || "",
        anonKey: settings.anonKey || "",
        recordId: settings.recordId || ""
      };
    } catch {
      return { url: "", anonKey: "", recordId: "" };
    }
  },

  saveSettings(settings) {
    const nextSettings = {
      url: settings.url?.trim() || "",
      anonKey: settings.anonKey?.trim() || "",
      recordId: settings.recordId?.trim() || ""
    };
    localStorage.setItem(FIELD_APP_CLOUD_SETTINGS_KEY, JSON.stringify(nextSettings));
    cloudClientPromise = null;
    return nextSettings;
  },

  clearSettings() {
    localStorage.removeItem(FIELD_APP_CLOUD_SETTINGS_KEY);
    cloudClientPromise = null;
  },

  isCloudConfigured() {
    const settings = this.loadSettings();
    return Boolean(settings.url && settings.anonKey && settings.recordId);
  },

  async getCloudClient() {
    const settings = this.loadSettings();
    if (!settings.url || !settings.anonKey) {
      throw new Error("Supabase URLとanon keyを設定してください。");
    }

    if (!cloudClientPromise) {
      cloudClientPromise = import(SUPABASE_MODULE_URL).then(({ createClient }) => (
        createClient(settings.url, settings.anonKey)
      ));
    }

    return cloudClientPromise;
  },

  async pushCloud(value = this.load()) {
    if (!value || !this.isCloudConfigured()) {
      return { skipped: true };
    }

    const settings = this.loadSettings();
    const client = await this.getCloudClient();
    const { error } = await client
      .from("field_app_states")
      .upsert({
        id: settings.recordId,
        data: value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { saved: true, updatedAt: new Date().toISOString() };
  },

  async testCloudConnection() {
    if (!this.isCloudConfigured()) {
      throw new Error("Supabase URL、anon key、共有データIDを設定してください。");
    }

    const settings = this.loadSettings();
    const client = await this.getCloudClient();
    const { error } = await client
      .from("field_app_states")
      .select("id")
      .eq("id", settings.recordId)
      .limit(1);

    if (error) throw error;
    return { ok: true };
  },

  async pullCloud() {
    if (!this.isCloudConfigured()) {
      throw new Error("クラウド同期が未設定です。");
    }

    const settings = this.loadSettings();
    const client = await this.getCloudClient();
    const { data, error } = await client
      .from("field_app_states")
      .select("data, updated_at")
      .eq("id", settings.recordId)
      .maybeSingle();

    if (error) throw error;
    if (!data?.data) return null;

    this.saveLocal(data.data);
    return {
      state: data.data,
      updatedAt: data.updated_at
    };
  }
};
