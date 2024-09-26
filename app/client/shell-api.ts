import { getRequestOptions } from "@/app/client/helper";

export interface ShellApiLoginRequest {
  username: string;
  password: string;
}

export interface ShellApiToken {
  id: number;
  user_id: number;
  key: string;
  status: number;
  name: string;
  created_time: number;
  accessed_time: number;
  expired_time: number;
  remain_quota: number;
  unlimited_quota: boolean;
  used_quota: number;
  models: string;
  subnet: string;
  ip_whitelist: string;
  billing_type: number;
  is_initial_token: boolean;
  remark: string;
  advertisement: string;
  ad_position: number;
}

enum Endpoints {
  LOGIN = "api/user/login",
  Tokens = "api/token/?p={{p}}&pageSize={{pageSize}}",
}

export class ShellApi {
  private readonly server_base_url: string;

  constructor(url: string) {
    this.server_base_url = url;
  }

  path(endpoint: Endpoints) {
    return [this.server_base_url, endpoint].join("/");
  }

  public async getTokens(data: ShellApiLoginRequest, p: number = 0, pageSize: number = 50): Promise<ShellApiToken[]> {
    try {
      const jwtToken = await this.getJwtToken(data);
      return await this.getUserTokenList(jwtToken, p, pageSize);
    } catch (error) {
      throw error;
    }
  }

  private async getJwtToken(data: ShellApiLoginRequest): Promise<string> {
    const res = await fetch(this.path(Endpoints.LOGIN), getRequestOptions("", data));
    const resJson = await res.json();
    if (resJson.success) {
      return resJson.token;
    } else {
      throw new Error(resJson.message ?? resJson.error ?? "Login failed");
    }
  }

  private async getUserTokenList(jwtToken: string, p: number = 0, pageSize: number = 50): Promise<ShellApiToken[]> {
    if (!jwtToken) throw new Error("jwtToken is empty");

    const reqOptions: RequestInit = {
      method: "GET",
      headers: {
        "X-S-Token": jwtToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const res = await fetch(
      this.path(Endpoints.Tokens).replace("{{p}}", p.toString()).replace("{{pageSize}}", pageSize.toString()),
      reqOptions,
    );
    const resJson = await res.json();
    if (resJson.success) {
      return resJson.data as ShellApiToken[];
    } else {
      throw new Error(resJson.message ?? resJson.error ?? "Get user token list failed");
    }
  }
}
