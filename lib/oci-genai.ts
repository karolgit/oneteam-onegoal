import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OciProfile = {
  user?: string;
  tenancy?: string;
  fingerprint?: string;
  region?: string;
  key_file?: string;
  pass_phrase?: string;
};

const OCI_MODELS: Record<string, string> = {
  "oci-cohere": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyaxe2fxtv2l34bov7e44xn6t57dlbj3t23wnhd4agx6wka",
  "oci-cohere-a": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyapnibwg42qjhwaxrlqfpreueirtwghiwvv2whsnwmnlva",
  "oci-llama": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyayjawvuonfkw2ua4bob4rlnnlhs522pafbglivtwlfzta",
  "oci-llama-4-scout": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyarojgfh6msa452vziycwfymle5gxdvpwwxzara53topmq",
  "oci-llama-3-3": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyazz5xnau6rie75wc2imyk4z54b6rg3z6rpbdlhox4cm7a",
  "oci-grok-3": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya6dvgvvj3ovy4lerdl6fvx525x3yweacnrgn4ryfwwcoq",
  "oci-grok-4": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya3bsfz4ogiuv3yc7gcnlry7gi3zzx6tnikg6jltqszm2q",
  "oci-grok-4-3": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya4fxp5zjj27q24rjxk46l43die7u6nclgwfbemklsdvoa",
  "oci-gemini-flash": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyavwtf4vi3u7mpzniugmfbinljhtnktexnmnikwolykzma",
  "oci-gemini-pro": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya5decawi4guyah3nf2tbv3fzhzb3kbagjn7nqxatuwxzq"
};

function expandHome(filePath: string) {
  if (filePath === "~") {
    return os.homedir();
  }

  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }

  return filePath;
}

function readOciConfig(profileName: string): OciProfile {
  const configPath = expandHome(process.env.OCI_CONFIG_FILE || "~/.oci/config");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  const config = fs.readFileSync(configPath, "utf8");
  const profile: OciProfile = {};
  let active = false;

  for (const rawLine of config.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    const section = line.match(/^\[(.+)]$/);

    if (section) {
      active = section[1] === profileName;
      continue;
    }

    if (!active) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim() as keyof OciProfile;
    const value = line.slice(separator + 1).trim();
    profile[key] = value;
  }

  return profile;
}

function getModelId(modelKey: string) {
  const overrideKey = `OCI_${modelKey.toUpperCase().replace(/-/g, "_")}_MODEL_ID`;
  return process.env[overrideKey] || process.env.OCI_GENAI_MODEL_ID || OCI_MODELS[modelKey] || OCI_MODELS["oci-llama"];
}

function getPrivateKey(profile: OciProfile) {
  const keyText = process.env.OCI_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const keyFile = process.env.OCI_PRIVATE_KEY_FILE || process.env.OCI_KEY_FILE || profile.key_file;

  if (keyText) {
    return keyText;
  }

  if (!keyFile) {
    throw new Error("OCI private key is not configured. Set OCI_PRIVATE_KEY or key_file in ~/.oci/config.");
  }

  return fs.readFileSync(expandHome(keyFile), "utf8");
}

function signRequest({
  body,
  host,
  method,
  pathName,
  profile
}: {
  body: string;
  host: string;
  method: string;
  pathName: string;
  profile: OciProfile;
}) {
  const user = process.env.OCI_USER_OCID || profile.user;
  const tenancy = process.env.OCI_TENANCY_OCID || profile.tenancy;
  const fingerprint = process.env.OCI_FINGERPRINT || profile.fingerprint;

  if (!user || !tenancy || !fingerprint) {
    throw new Error("OCI user, tenancy, or fingerprint is missing. Check ~/.oci/config or OCI_* environment variables.");
  }

  const date = new Date().toUTCString();
  const contentHash = crypto.createHash("sha256").update(body).digest("base64");
  const contentLength = Buffer.byteLength(body).toString();
  const contentType = "application/json";
  const headers = "(request-target) date host content-length content-type x-content-sha256";
  const signingString = [
    `(request-target): ${method.toLowerCase()} ${pathName}`,
    `date: ${date}`,
    `host: ${host}`,
    `content-length: ${contentLength}`,
    `content-type: ${contentType}`,
    `x-content-sha256: ${contentHash}`
  ].join("\n");
  const privateKey = crypto.createPrivateKey({
    key: getPrivateKey(profile),
    passphrase: process.env.OCI_PRIVATE_KEY_PASSPHRASE || profile.pass_phrase
  });
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingString), privateKey).toString("base64");
  const keyId = `${tenancy}/${user}/${fingerprint}`;

  return {
    authorization: `Signature version="1",keyId="${keyId}",algorithm="rsa-sha256",headers="${headers}",signature="${signature}"`,
    date,
    contentHash,
    contentLength,
    contentType
  };
}

function buildChatBody({
  compartmentId,
  history,
  message,
  modelKey,
  modelId,
  system
}: {
  compartmentId: string;
  history: ChatMessage[];
  message: string;
  modelKey: string;
  modelId: string;
  system: string;
}) {
  const isCohere = modelKey.includes("cohere");

  if (isCohere) {
    const prior = history
      .slice(-8)
      .map((item) => `${item.role === "user" ? "User" : "Chatbot"}: ${item.content}`)
      .join("\n");

    return {
      compartmentId,
      servingMode: {
        servingType: "ON_DEMAND",
        modelId
      },
      chatRequest: {
        apiFormat: "COHERE",
        message,
        maxTokens: 900,
        temperature: 0.4,
        preambleOverride: prior ? `${system}\n\nConversation so far:\n${prior}` : system
      }
    };
  }

  const messages = [
    {
      role: "USER",
      content: [
        {
          type: "TEXT",
          text: `${system}\n\n${message}`
        }
      ]
    }
  ];

  for (const item of history.slice(-6)) {
    messages.splice(messages.length - 1, 0, {
      role: item.role === "user" ? "USER" : "ASSISTANT",
      content: [
        {
          type: "TEXT",
          text: item.content
        }
      ]
    });
  }

  return {
    compartmentId,
    servingMode: {
      servingType: "ON_DEMAND",
      modelId
    },
    chatRequest: {
      apiFormat: "GENERIC",
      messages,
      maxTokens: modelKey.includes("gemini") ? 1600 : 900,
      temperature: 0.4,
      topP: 0.75,
      frequencyPenalty: modelKey.includes("grok") ? undefined : 0,
      presencePenalty: modelKey.includes("grok") ? undefined : 0
    }
  };
}

function extractText(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.text === "string") {
    return record.text;
  }

  const chatResponse = record.chatResponse ?? record.chat_response;

  if (chatResponse) {
    return extractText(chatResponse);
  }

  const choices = record.choices;

  if (Array.isArray(choices)) {
    for (const choice of choices) {
      const text = extractText(choice);

      if (text) {
        return text;
      }
    }
  }

  const message = record.message;

  if (message) {
    return extractText(message);
  }

  const content = record.content;

  if (Array.isArray(content)) {
    for (const item of content) {
      const text = extractText(item);

      if (text) {
        return text;
      }
    }
  }

  return undefined;
}

export async function callOciGenAi({
  history,
  message,
  model,
  system
}: {
  history: ChatMessage[];
  message: string;
  model: string;
  system: string;
}) {
  const profileName = process.env.OCI_CONFIG_PROFILE || "DEFAULT";
  const profile = readOciConfig(profileName);
  const region = process.env.OCI_REGION || profile.region || "us-chicago-1";
  const compartmentId = process.env.OCI_COMPARTMENT_ID || process.env.OCI_TENANCY_OCID || profile.tenancy;

  if (!compartmentId) {
    throw new Error("OCI_COMPARTMENT_ID is not configured.");
  }

  const host = `inference.generativeai.${region}.oci.oraclecloud.com`;
  const pathName = "/20231130/actions/chat";
  const modelId = getModelId(model);
  const body = JSON.stringify(
    buildChatBody({
      compartmentId,
      history,
      message,
      modelKey: model,
      modelId,
      system
    })
  );
  const signed = signRequest({
    body,
    host,
    method: "post",
    pathName,
    profile
  });
  const response = await fetch(`https://${host}${pathName}`, {
    method: "POST",
    headers: {
      authorization: signed.authorization,
      date: signed.date,
      host,
      "content-length": signed.contentLength,
      "content-type": signed.contentType,
      "x-content-sha256": signed.contentHash
    },
    body
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`OCI GenAI request failed (${response.status}): ${responseText.slice(0, 500)}`);
  }

  const data = JSON.parse(responseText) as unknown;
  const text = extractText(data);

  if (!text) {
    throw new Error("OCI GenAI returned an empty response.");
  }

  return text;
}
