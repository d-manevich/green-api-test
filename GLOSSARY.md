# Telegram Chat

A minimal web chat for sending and receiving text messages in Telegram through a GREEN-API instance.

## Language

### Account

**Instance**:
A GREEN-API account linked to one Telegram account; everything the user sends or receives goes through it.
_Avoid_: Account, bot, session

**Credentials**:
The pair the user enters to sign in to an Instance: `idInstance` and `apiTokenInstance`.
_Avoid_: Login, keys, auth

### Conversation

**Chat**:
A one-to-one conversation between the Instance and a single Recipient.
_Avoid_: Dialog, thread, conversation

**Recipient**:
The Telegram user on the other side of a Chat, identified by phone number.
_Avoid_: Contact, receiver, peer

**Chat ID**:
Telegram's numeric identifier of a Recipient, resolved from their phone number; distinct from the phone number itself.
_Avoid_: Phone, user ID

**Message**:
A single text sent within a Chat, either **outgoing** (sent by the user) or **incoming** (sent by the Recipient).
_Avoid_: Text, post

### Receiving

**Notification**:
An event GREEN-API queues for the Instance, such as an incoming Message or a delivery status.
_Avoid_: Webhook, event, update

**Notification queue**:
The per-Instance FIFO of Notifications that the app reads and clears one by one.
_Avoid_: Inbox, feed
