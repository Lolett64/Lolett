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

export interface OrderConfirmationProps {
  orderNumber: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export function OrderConfirmation({
  orderNumber,
  items,
  subtotal,
  shipping,
  total,
  customer,
}: OrderConfirmationProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Merci pour ta commande #{orderNumber} — LOLETT</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>LOLETT</Text>
            <Text style={taglineStyle}>Mode Homme &amp; Femme</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Titre */}
          <Section style={sectionStyle}>
            <Text style={h1Style}>Merci pour ta commande !</Text>
            <Text style={microcopyStyle}>Excellente decision. Vraiment.</Text>
          </Section>

          {/* Numéro de commande */}
          <Section style={sectionStyle}>
            <Text style={labelStyle}>Commande</Text>
            <Text style={orderNumberStyle}>#{orderNumber}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Récapitulatif articles */}
          <Section style={sectionStyle}>
            <Text style={h2Style}>Recapitulatif</Text>

            {items.map((item, index) => (
              <Section key={index} style={itemRowStyle}>
                <Text style={itemNameStyle}>
                  {item.productName}{' '}
                  <span style={itemMetaStyle}>
                    — Taille {item.size} × {item.quantity}
                  </span>
                </Text>
                <Text style={itemPriceStyle}>
                  {(item.price * item.quantity).toFixed(2)} EUR
                </Text>
              </Section>
            ))}
          </Section>

          <Hr style={hrStyle} />

          {/* Totaux */}
          <Section style={sectionStyle}>
            <Section style={totalRowStyle}>
              <Text style={totalLabelStyle}>Sous-total</Text>
              <Text style={totalValueStyle}>{subtotal.toFixed(2)} EUR</Text>
            </Section>

            <Section style={totalRowStyle}>
              <Text style={totalLabelStyle}>Livraison</Text>
              <Text style={totalValueStyle}>
                {shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} EUR`}
              </Text>
            </Section>

            <Hr style={hrThinStyle} />

            <Section style={totalRowStyle}>
              <Text style={grandTotalLabelStyle}>Total</Text>
              <Text style={grandTotalValueStyle}>{total.toFixed(2)} EUR</Text>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          {/* Adresse de livraison */}
          <Section style={sectionStyle}>
            <Text style={h2Style}>Adresse de livraison</Text>
            <Text style={addressStyle}>
              {customer.firstName} {customer.lastName}
            </Text>
            <Text style={addressStyle}>{customer.address}</Text>
            <Text style={addressStyle}>
              {customer.postalCode} {customer.city}
            </Text>
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

export default OrderConfirmation;

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

const hrThinStyle: React.CSSProperties = {
  borderColor: '#eeeeee',
  borderTopWidth: '1px',
  margin: '12px 0',
};

const sectionStyle: React.CSSProperties = {
  padding: '0',
};

const h1Style: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#111111',
  margin: '0 0 8px',
};

const microcopyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#555555',
  margin: '0',
  fontStyle: 'italic',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 4px',
};

const orderNumberStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111111',
  margin: '0',
};

const h2Style: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111111',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 0 16px',
};

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '10px',
};

const itemNameStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#111111',
  margin: '0',
  flex: 1,
};

const itemMetaStyle: React.CSSProperties = {
  color: '#888888',
  fontWeight: '400',
};

const itemPriceStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#111111',
  margin: '0',
  fontWeight: '500',
  textAlign: 'right',
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#555555',
  margin: '0',
};

const totalValueStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#111111',
  margin: '0',
};

const grandTotalLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#111111',
  margin: '0',
};

const grandTotalValueStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#111111',
  margin: '0',
};

const addressStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#444444',
  margin: '0 0 2px',
  lineHeight: '1.5',
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
