"use server";
import { getAuth } from "@/auth/cookie";
import xeroClient from "@/lib/xero/xeroClient";
import { getValidXeroToken, getXeroTokenInfo } from "./setupXeroAuth";
import { mapToken } from "@/helpers/mapXeroToken";
import { Contact, Contacts } from "xero-node";
import { prisma } from "@/lib/prisma";
import getContacts from "./getContacts";

export default async function createContacts(contactList: Contact[]) {
  const { user } = await getAuth();

  if (!user) return;

  const xeroToken = await getXeroTokenInfo(user.id);

  if (!xeroToken) return;

  if (!xeroToken.accessValid || xeroToken.accessExpiringSoon) {
    await getValidXeroToken(user.id);
  }

  const tokenSetParameters = mapToken(user.xeroTokens[0]);

  await xeroClient.setTokenSet(tokenSetParameters);

  const tenantId = user.xeroTokens[0].tenantId;
  if (!tenantId) return;

  const response = await getContacts();

  let unexistingContacts: Contact[] = [];

  if (response?.body) {
    const existingContacts = response.body.contacts;
    unexistingContacts = contactList.filter((contact) => {
      const existingContact = existingContacts?.find(
        (c) => c.name === contact.name
      );

      if (!existingContact) {
        return true;
      }

      return false;
    });
  }

  const contacts: Contacts = {
    contacts: unexistingContacts,
  };

  try {
    const { body } = await xeroClient.accountingApi.createContacts(
      tenantId,
      contacts
    );

    if (body.contacts) {
      for (const contact of body.contacts) {
        if (contact.contactID) {
          await prisma.contact.upsert({
            where: { contactId: contact.contactID },
            create: {
              contactId: contact.contactID,
              name: contact.name as string,
            },
            update: {},
          });
        }
      }

      return body.contacts;
    }
  } catch (err) {
    console.log(`Error creating Contact: ${err}}`);
  }
}
