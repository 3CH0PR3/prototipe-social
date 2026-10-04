import { API } from "@config/api/core"
import { Http } from "@shared/http/Http"

export const UserService = {
  async fetch() {
    return await Http.get(API.social.);
  }
}
