---
title: Coordinated Vulnerability Disclosure Policy
lastmod: 2026-09-11
url: /cvd-policy
customjs: js/pages/privacy.js
header_type: fixed-header
body_class: privacy cvd-policy
---

# Coordinated Vulnerability Disclosure Policy

{{< date label="Last updated:" >}}

1. ## Why we have this Policy

   Security is an integral part of how we develop and maintain our product.

   We welcome responsible disclosure of security risks and product vulnerabilities by our customers,
   security researchers, and anyone who may discover a potential vulnerability.

   This Policy explains how to report a security vulnerability affecting Spine Event Engine
   (“Spine”), how we handle the information you provide, and what you can expect from us in
   response.

1. ## What this Policy covers

   This Policy covers Spine, along with the third-party components we use inside it.

1. ## How to report

   Our single point of contact for vulnerability reports is {{< cloakemail "cra-request@codematters.ltd" >}}.

   When submitting a report, please indicate the affected version and include the following, where
   available:

   - the name of the security risk and any relevant CWE and CVE identifiers;
   - a description of the issue and clear steps to reproduce it;
   - an illustrative example; and
   - your assessment of the impact.

   We appreciate reports submitted in English.

   Please report the vulnerability to us before making any information about it public.

1. ## What happens next

   We will confirm receipt of your report within 3 business days.

   Within the next 10 business days, we will inform you of the results of our initial assessment.

   After that, we will provide the issue status updates at least once every 30 business days until
   the matter is resolved or otherwise closed.

1. ## Publication

   Once the fix is available, we publish an advisory on our website and reference it in the release
   notes.

   We ask you to coordinate the timing of any public disclosure with us. As a general rule, this
   means waiting until we have released a fix or until 90 days have passed since your report,
   whichever is earlier.

1. ## Rules we ask you to follow

   When conducting security research and reporting a vulnerability under this Policy, we ask that
   you:

   - act in good faith, and only to identify and report a vulnerability;
   - use your own systems, licences and test data;
   - stop testing once you have confirmed the vulnerability, and collect only the information
     reasonably necessary to demonstrate it;
   - avoid any activity that could harm our systems, our customers, or other people's data;
   - keep information about the vulnerability confidential until disclosure has been coordinated
     with us.

1. ## What you can expect from us

   If you follow this Policy, we will keep your report confidential and will not take legal action
   against you or report your research to law enforcement.

1. ## Third-party components

   Spine incorporates third-party components and other dependencies. Where a vulnerability in such a
   component affects Spine, we will treat the vulnerability as an issue affecting our product and
   address it accordingly.

   When such an issue is reported, we will assess its impact on Spine, coordinate with the relevant
   third-party maintainer, publish a security advisory where users are affected, and make available
   any fixes or updates provided by the third-party provider.

   Where no fix is available, we will identify appropriate measures to eliminate or mitigate the
   risk and inform affected users of any actions they should take in the meantime.

   If we develop a fix for the affected third-party component ourselves, we will, where appropriate,
   share or coordinate that fix with the component's maintainer.

1. ## Reporting to authorities

   Where required by applicable law, we will notify the competent authorities, including the
   Portuguese CSIRT (CNCS/CERT.PT) and ENISA, of actively exploited vulnerabilities and severe security
   incidents affecting Spine within the time limits prescribed by the Cyber Resilience Act. We will
   also inform affected users where required.

   Such notifications describe the vulnerability, not the person who reported it. We do not share
   your identity with authorities unless the law obliges us to.
