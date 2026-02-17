import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

export interface ContactAcknowledgmentProps {
  name: string;
}

export function ContactAcknowledgment({ name }: ContactAcknowledgmentProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>On a bien recu ton message — LOLETT</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>LOLETT</Text>
            <Text style={taglineStyle}>Mode Homme &amp; Femme</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Corps */}
          <Section style={sectionStyle}>
            <Text style={h1Style}>On a bien recu ton message !</Text>
            <Text style={bodyTextStyle}>
              Bonjour {name},
            </Text>
            <Text style={bodyTextStyle}>
              L&apos;equipe LOLETT te repondra dans les plus brefs delais. On prend le temps de lire chaque message.
            </Text>
            <Text style={microcopyStyle}>
              En attendant, n&apos;hesite pas a faire un tour dans la boutique.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href="https://lolett.fr" style={linkStyle}>
              Visiter la boutique
            </Link>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>LOLETT — Mode Homme &amp; Femme</Text>
            <Link href="https://lolett.fr" style={footerLinkStyle}>
              lolett.fr
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactAcknowledgment;

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
  fontSize: '22px',
  fontWeight: '700',
  color: '#111111',
  margin: '0 0 20px',
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const microcopyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#555555',
  fontStyle: 'italic',
  margin: '8px 0 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
};

const linkStyle: React.CSSProperties = {
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
  margin: '0 0 4px',
  letterSpacing: '1px',
};

const footerLinkStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#111111',
  textDecoration: 'none',
};
