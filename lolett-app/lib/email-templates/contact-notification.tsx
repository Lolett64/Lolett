import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

export interface ContactNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

export function ContactNotification({
  name,
  email,
  subject,
  message,
  sentAt,
}: ContactNotificationProps) {
  const replyHref = `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Nouveau message de {name} — {subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>LOLETT</Text>
            <Text style={taglineStyle}>Notification Admin</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Titre */}
          <Section style={sectionStyle}>
            <Text style={h1Style}>Nouveau message de contact</Text>
            <Text style={dateStyle}>{sentAt}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Champs du message */}
          <Section style={sectionStyle}>
            <Text style={fieldLabelStyle}>Nom</Text>
            <Text style={fieldValueStyle}>{name}</Text>

            <Text style={fieldLabelStyle}>Email</Text>
            <Text style={fieldValueStyle}>{email}</Text>

            <Text style={fieldLabelStyle}>Sujet</Text>
            <Text style={fieldValueStyle}>{subject}</Text>

            <Text style={fieldLabelStyle}>Message</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Bouton répondre */}
          <Section style={ctaSection}>
            <Button href={replyHref} style={buttonStyle}>
              Repondre
            </Button>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>LOLETT — Mode Homme &amp; Femme</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactNotification;

/* ---- Styles ---- */

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f9f9f7',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  maxWidth: '560px',
  padding: '0 24px 32px',
  borderRadius: '4px',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '32px',
  paddingBottom: '8px',
};

const logoStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '6px',
  color: '#111111',
  margin: '0',
  textTransform: 'uppercase',
};

const taglineStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '4px 0 0',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#eeeeee',
  borderTopWidth: '1px',
  margin: '24px 0',
};

const sectionStyle: React.CSSProperties = {
  padding: '0',
};

const h1Style: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111111',
  margin: '0 0 4px',
};

const dateStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#888888',
  margin: '0',
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 4px',
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#111111',
  margin: '0 0 16px',
};

const messageStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  margin: '0',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#111111',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: '2px',
  display: 'inline-block',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '8px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#888888',
  margin: '0',
  letterSpacing: '1px',
};
