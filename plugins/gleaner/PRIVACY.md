# Gleaner privacy policy

Last updated: November 3, 2026

## Scope and publisher

Gleaner is an open-source research-clipping plugin maintained by Shawn Sandy. This policy describes the Gleaner plugin, including its skills and bundled formatting helper. It does not cover the separate Gleaner website or replace the policies of ChatGPT, Claude, your browser, or connected services.

Gleaner runs through the AI host and tools available in your session. The distributed plugin has no Gleaner-operated backend, account system, advertising system, or analytics collector. The bundled formatting helper runs locally and does not make network requests. Installing Gleaner does not give its maintainer access to your conversations, clips, or connected accounts.

## Information used and why

Gleaner processes the information needed to carry out your request:

- Page URLs, titles, authors, selected passages, page text, video descriptions, chapters, and available transcript text, to prepare sourced summaries and timestamp links.
- Your clipping requests, supplied text, notes, and relevant conversation content, to identify what to save and produce the requested clip or follow-ups.
- Clip titles, dates, categories, tags, summaries, source links, and destination links, to save, find, update, and check for duplicate clips. Searches may read existing clips and, where supported and within the requested scope, past conversations.
- Destination labels, folder or database identifiers, local paths, format preferences, and optional index settings, to use the locations and formats you select. Local synchronization bookkeeping records the selected preferences document and the last verified preference state.

These fields can contain personal information when it appears in the material you choose. Gleaner does not need passwords, API keys, payment-card details, government identifiers, or protected health information. Do not include them in clipping requests, preference files, or support reports. Sign in through the host or connected service rather than giving credentials to the skill.

## Where information goes

Your AI host processes requests and source material under its own account settings and privacy policy. Browser and web-fetch tools contact the sites you ask to read. Those sites and tool providers may receive ordinary request information under their own policies.

Clips remain in the conversation by default, with a downloadable file when supported. If you select Google Drive, Notion, a local or project folder, or a supported Claude artifact, the corresponding content and metadata are sent to that destination through your own connection. An optional clip list or requested index contains metadata and links to the clips it tracks. In ChatGPT, maintaining a persistent Library index requires an explicit request or applicable project instruction.

Preferences can stay in local configuration files or session memory. Enabling Drive synchronization sends the user preference document to your connected Google Drive, including any destination paths it contains. On hosts without local file access, you can choose Drive as the persistent preference store. Project overrides, session-only settings, and local synchronization bookkeeping are not uploaded by preference sync. Sharing and administrator settings on your host and destination determine who else can access stored information.

Gleaner does not send a separate copy of your research to its maintainer, sell it, or use a Gleaner-operated service to profile you. If you voluntarily contact the maintainer, the communication is handled by the service you use. GitHub issues are public: share only the minimum information needed and remove private research, personal information, and credentials.

## Links and referral attribution

Gleaner adds the common `utm_source=gleaner` referral tag to eligible Further reading and video Links URLs. A site you visit can use that tag to recognize that the link came from a Gleaner clip. This tag is not a user-specific identifier and does not send a click report to a Gleaner backend. Source and timestamp links are not tagged. Existing attribution and signed links are left unchanged. You can remove the added referral parameter from a clip's links before visiting or sharing them.

## Retention and deletion

Gleaner has no separate server-side retention period because it does not operate a storage backend for your clips. Local clips, indexes, preferences, and synchronization bookkeeping remain until you delete or change them. Conversation content, attachments, Library files, cloud clips, and synchronized preferences remain according to the retention and deletion settings of their host, destination, or organization; Gleaner does not impose a separate automatic expiry.

Delete clips, downloaded copies, indexes, and list rows in each location where they are stored. Remove local preference and synchronization files if you want to remove those records, and delete the Drive `Agent Preferences` document if you enabled cloud storage or sync. Resetting a preference, disabling sync, disconnecting a service, or uninstalling Gleaner does not by itself delete earlier content or copies. Some same-session Drive updates move the earlier copy to trash; trash, version history, and backups follow the provider's retention rules.

Support communications follow the retention rules of the service used to send them. Public GitHub content may remain accessible in notifications, history, or third-party copies after a change or deletion.

## Your controls

You choose what to clip and where to save it. You can keep delivery in the conversation, change or reset save preferences, disable optional sync or clip lists, remove a project instruction that enables index maintenance, revoke connections through the host or service, and uninstall the plugin. Review destination sharing settings before saving sensitive material. Requests to delete data held by a host or connected service must be handled through that service's controls; the Gleaner maintainer cannot access or erase your account's stored clips.

## Contact and changes

For non-sensitive privacy questions, use the [Gleaner issue tracker](https://github.com/shawn-sandy/gleaner/issues) or the contact options published on [Shawn Sandy's GitHub profile](https://github.com/shawn-sandy). Do not post private content in public issues. Updates to this policy are published here with a revised date; repository history records earlier versions.
