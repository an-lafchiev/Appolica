import { XeroClient } from "xero-node";

const xeroClient = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_SECRET!,
  redirectUris: [`${process.env.APP_URL}/dashboard`],
  scopes:
    "openid profile email accounting.contacts accounting.settings accounting.transactions offline_access".split(
      " "
    ),
  // state: "returnPage=my-sweet-dashboard", // custom params (optional)
  // httpTimeout: 3000, // ms (optional)
  // clockTolerance: 10, // seconds (optional)
});

await xeroClient.initialize();

export default xeroClient;
