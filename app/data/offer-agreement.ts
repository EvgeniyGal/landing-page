import { Locale } from "@/app/data/site-content";
import { contactEmail, SITE_NAME } from "@/lib/seo";

type LocalizedText = {
  en: string;
  uk: string;
};

const t = (text: LocalizedText, locale: Locale) => text[locale];

const copy = {
  linkLabel: { en: "Offer Agreement", uk: "Договір оферти" },
  title: { en: "Public Offer Agreement", uk: "Договір публічної оферти" },
  updated: { en: "Effective date: 26 August 2026", uk: "Дата набрання чинності: 26 серпня 2026" },
  close: { en: "Close", uk: "Закрити" },
  closeAria: { en: "Close offer agreement", uk: "Закрити договір оферти" },
};

const sections: { heading: LocalizedText; paragraphs: LocalizedText[] }[] = [
  {
    heading: { en: "1. General provisions", uk: "1. Загальні положення" },
    paragraphs: [
      {
        en: `This Public Offer Agreement (the "Agreement") is issued by ${SITE_NAME} (the "Contractor") and is addressed to any legally capable person (the "Client") who wishes to order automation, software, or related consulting services.`,
        uk: `Цей Договір публічної оферти («Договір») розміщує ${SITE_NAME} («Виконавець») і адресує його будь-якій дієздатній особі («Замовник»), яка бажає замовити послуги з автоматизації, розробки програмного забезпечення чи пов'язаного консалтингу.`,
      },
      {
        en: "By submitting an inquiry through the website contact form, confirming a statement of work, or paying an invoice issued by the Contractor, the Client fully and unconditionally accepts this Agreement.",
        uk: "Надсилаючи запит через форму на сайті, підтверджуючи бриф / statement of work або оплачуючи рахунок Виконавця, Замовник повністю та беззастережно акцептує цей Договір.",
      },
    ],
  },
  {
    heading: { en: "2. Subject of the agreement", uk: "2. Предмет договору" },
    paragraphs: [
      {
        en: "The Contractor provides services that may include AI-powered workflow design, n8n and API automations, custom full-stack development, system integrations, and related advisory work.",
        uk: "Виконавець надає послуги, що можуть включати проєктування AI-процесів, автоматизації на n8n та API, кастомну full-stack розробку, інтеграції систем і супутній консалтинг.",
      },
      {
        en: "The exact scope, timeline, deliverables, and fee for each engagement are defined in a written confirmation, proposal, or invoice agreed by the parties.",
        uk: "Конкретний обсяг, строки, результати та вартість кожного залучення визначаються в письмовому підтвердженні, пропозиції або рахунку, погоджених сторонами.",
      },
    ],
  },
  {
    heading: { en: "3. Ordering and acceptance", uk: "3. Замовлення та акцепт" },
    paragraphs: [
      {
        en: "The Client describes the work to be automated or built. The Contractor may request additional details, then issues a proposal or invoice. The Agreement is concluded when the Client accepts the proposal in writing or pays the invoice.",
        uk: "Замовник описує роботу, яку потрібно автоматизувати або побудувати. Виконавець може запросити додаткові деталі, після чого надсилає пропозицію або рахунок. Договір вважається укладеним, коли Замовник письмово акцептує пропозицію або оплачує рахунок.",
      },
    ],
  },
  {
    heading: { en: "4. Fees and payment", uk: "4. Вартість і оплата" },
    paragraphs: [
      {
        en: "Fees are stated in the proposal or invoice and are payable according to the schedule specified there (including any prepayment). Work may be paused if payment is late.",
        uk: "Вартість зазначається в пропозиції або рахунку і сплачується згідно з графіком, вказаним у цих документах (включно з передоплатою, якщо вона передбачена). У разі прострочення оплати виконання робіт може бути призупинено.",
      },
      {
        en: "Unless otherwise agreed in writing, invoices are due within the period stated on the invoice. Taxes, if applicable, are handled according to the Contractor's status and the Client's jurisdiction.",
        uk: "Якщо інше не погоджено письмово, рахунки підлягають оплаті в строк, зазначений у рахунку. Податки, якщо застосовуються, обліковуються відповідно до статусу Виконавця та юрисдикції Замовника.",
      },
    ],
  },
  {
    heading: {
      en: "5. Acceptance of completed services",
      uk: "5. Приймання наданих послуг (виконаних робіт)",
    },
    paragraphs: [
      {
        en: "The Parties agree that the execution of a separate bilateral Act of Acceptance of Completed Services (Works) is not mandatory. Payment of the Contractor’s invoice by the Customer shall constitute full confirmation of the proper performance and acceptance of the services (works) by the Customer without any claims or objections regarding their quality, timeline, or scope.",
        uk: "Сторони дійшли згоди, що підписання окремого двостороннього Акта приймання-передачі наданих послуг (виконаних робіт) не є обов’язковим. Оплата Замовником рахунку-фактури (інвойсу) Виконавця є підтвердженням належного виконання та повного прийняття робіт (послуг) Замовником без будь-яких претензій чи зауважень до їх якості, строків та обсягу.",
      },
    ],
  },
  {
    heading: { en: "6. Rights and obligations", uk: "6. Права та обов'язки сторін" },
    paragraphs: [
      {
        en: "The Contractor shall perform the agreed services with reasonable professional care and keep the Client informed of material progress or blockers.",
        uk: "Виконавець зобов'язується надавати погоджені послуги з розумною професійною старанністю та інформувати Замовника про суттєвий прогрес або блокери.",
      },
      {
        en: "The Client shall provide timely access, source materials, decisions, and feedback reasonably required to complete the work.",
        uk: "Замовник зобов'язується своєчасно надавати доступ, вихідні матеріали, рішення та зворотний зв'язок, розумно необхідні для виконання робіт.",
      },
    ],
  },
  {
    heading: { en: "7. Intellectual property", uk: "7. Інтелектуальна власність" },
    paragraphs: [
      {
        en: "Upon full payment, the Client receives the rights to use the custom deliverables created specifically for that engagement. Pre-existing tools, libraries, templates, and know-how of the Contractor remain the Contractor's property.",
        uk: "Після повної оплати Замовник отримує права користування кастомними результатами, створеними саме для цього залучення. Наявні інструменти, бібліотеки, шаблони та ноу-хау Виконавця залишаються власністю Виконавця.",
      },
    ],
  },
  {
    heading: { en: "8. Confidentiality", uk: "8. Конфіденційність" },
    paragraphs: [
      {
        en: "Each party shall keep confidential information received from the other party confidential and use it only to perform this Agreement, except where disclosure is required by law.",
        uk: "Кожна сторона зобов'язується зберігати конфіденційність інформації, отриманої від іншої сторони, і використовувати її лише для виконання цього Договору, крім випадків, коли розкриття вимагається законом.",
      },
    ],
  },
  {
    heading: { en: "9. Liability", uk: "9. Відповідальність" },
    paragraphs: [
      {
        en: "The Contractor is not liable for indirect, incidental, or lost-profit damages. Total liability under an engagement is limited to the fees actually paid by the Client for that engagement, except in cases of willful misconduct where a greater liability cannot be limited by law.",
        uk: "Виконавець не несе відповідальності за непрямі збитки, упущену вигоду чи випадкові втрати. Сукупна відповідальність за конкретне залучення обмежується сумою фактично сплаченої Замовником винагороди за це залучення, крім випадків умисних дій, коли закон не дозволяє обмежити відповідальність.",
      },
    ],
  },
  {
    heading: { en: "10. Term and termination", uk: "10. Строк і розірвання" },
    paragraphs: [
      {
        en: "The Agreement remains in force for the duration of the accepted engagement. Either party may terminate an engagement by written notice if the other party materially breaches the Agreement and fails to remedy the breach within a reasonable period.",
        uk: "Договір діє протягом строку акцептованого залучення. Будь-яка сторона може розірвати залучення письмовим повідомленням, якщо інша сторона істотно порушує Договір і не усуває порушення в розумний строк.",
      },
    ],
  },
  {
    heading: { en: "11. Final provisions", uk: "11. Прикінцеві положення" },
    paragraphs: [
      {
        en: `This Agreement is governed by the law of Ukraine, unless a different governing law is agreed in writing for a specific engagement. For notices: ${SITE_NAME}, ${contactEmail}.`,
        uk: `Цей Договір регулюється законодавством України, якщо для конкретного залучення письмово не погоджено інше право. Для повідомлень: ${SITE_NAME}, ${contactEmail}.`,
      },
      {
        en: "The Contractor may update this public offer by publishing a new version on the website. Updates apply to engagements accepted after the new effective date.",
        uk: "Виконавець може оновлювати цю публічну оферту, публікуючи нову редакцію на сайті. Оновлення застосовуються до залучень, акцептованих після нової дати набрання чинності.",
      },
    ],
  },
];

export function getOfferAgreement(locale: Locale) {
  return {
    linkLabel: t(copy.linkLabel, locale),
    title: t(copy.title, locale),
    updated: t(copy.updated, locale),
    close: t(copy.close, locale),
    closeAria: t(copy.closeAria, locale),
    sections: sections.map((section) => ({
      heading: t(section.heading, locale),
      paragraphs: section.paragraphs.map((paragraph) => t(paragraph, locale)),
    })),
  };
}
