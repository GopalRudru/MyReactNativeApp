import { secureFetch } from "../apiClient/apiClient";
import dictionary from "../dictionary";
const { customerJourney } = dictionary;

const customerJourneyService = {
    secureWebViewToken: (body: any) =>
        secureFetch({
          url: customerJourney?.webviewToken(),
          method: "POST",
          body,
        }),
}

export default customerJourneyService;