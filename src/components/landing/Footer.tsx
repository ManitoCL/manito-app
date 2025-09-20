/**
 * Enterprise Footer
 * Professional footer with Chilean compliance and contact information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';
import { Icons } from '../icons';

interface FooterLink {
  title: string;
  onPress: () => void;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  style?: any;
}

export const Footer: React.FC<FooterProps> = ({ style }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:contacto@manito.cl');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+56222345678');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://manito.cl');
  };

  const footerSections: FooterSection[] = [
    {
      title: 'Servicios',
      links: [
        { title: 'Plomería', onPress: () => {} },
        { title: 'Electricidad', onPress: () => {} },
        { title: 'Limpieza', onPress: () => {} },
        { title: 'Reparaciones', onPress: () => {} },
        { title: 'Jardinería', onPress: () => {} },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { title: 'Sobre Nosotros', onPress: () => {} },
        { title: 'Cómo Funciona', onPress: () => {} },
        { title: 'Carreras', onPress: () => {} },
        { title: 'Prensa', onPress: () => {} },
        { title: 'Blog', onPress: () => {} },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { title: 'Centro de Ayuda', onPress: () => {} },
        { title: 'Contacto', onPress: handleEmailPress },
        { title: 'Chat en Vivo', onPress: () => {} },
        { title: 'Estado del Servicio', onPress: () => {} },
        { title: 'Reportar Problema', onPress: () => {} },
      ],
    },
    {
      title: 'Legal',
      links: [
        { title: 'Términos de Servicio', onPress: () => {} },
        { title: 'Política de Privacidad', onPress: () => {} },
        { title: 'Política de Cookies', onPress: () => {} },
        { title: 'Resolución de Disputas', onPress: () => {} },
        { title: 'Cumplimiento SERNAC', onPress: () => {} },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/manitochile',
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/manitochile',
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/company/manito-chile',
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: 'https://twitter.com/manitochile',
    },
  ];

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Footer Content */}
      <View style={styles.mainContent}>
        {/* Company Info */}
        <View style={styles.companySection}>
          <Text style={styles.logo}>Manito</Text>
          <Text style={styles.tagline}>
            La plataforma más confiable de Chile para servicios del hogar
          </Text>

          {/* Contact Information */}
          <View style={styles.contactInfo}>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Icons.Support size={16} color={colors.text.secondary} />
              <Text style={styles.contactText}>contacto@manito.cl</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Icons.Support size={16} color={colors.text.secondary} />
              <Text style={styles.contactText}>+56 2 2234 5678</Text>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <Icons.ChileMap size={16} color={colors.text.secondary} />
              <Text style={styles.contactText}>
                Av. Providencia 1234, Providencia{'\n'}Santiago, Chile
              </Text>
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Síguenos</Text>
            <View style={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialLink}
                  onPress={() => handleSocialPress(social.url)}
                  accessibilityLabel={`Visitar ${social.name}`}
                >
                  <Text style={styles.socialIcon}>{social.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Footer Links */}
        <View style={styles.linksSection}>
          {footerSections.map((section, index) => (
            <View key={index} style={styles.linkColumn}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.links.map((link, linkIndex) => (
                <TouchableOpacity
                  key={linkIndex}
                  style={styles.linkItem}
                  onPress={link.onPress}
                >
                  <Text style={styles.linkText}>{link.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Compliance Section */}
      <View style={styles.complianceSection}>
        <View style={styles.complianceHeader}>
          <Icons.ShieldCheck size={20} color={colors.success[500]} />
          <Text style={styles.complianceTitle}>Cumplimiento y Certificaciones</Text>
        </View>

        <View style={styles.complianceBadges}>
          <View style={styles.complianceBadge}>
            <Text style={styles.badgeText}>SERNAC</Text>
          </View>
          <View style={styles.complianceBadge}>
            <Text style={styles.badgeText}>Transbank</Text>
          </View>
          <View style={styles.complianceBadge}>
            <Text style={styles.badgeText}>ISO 27001</Text>
          </View>
          <View style={styles.complianceBadge}>
            <Text style={styles.badgeText}>PCI DSS</Text>
          </View>
        </View>

        <Text style={styles.complianceText}>
          Manito SpA • RUT: 76.XXX.XXX-X • Registro de Marca N° XXXXXX{'\n'}
          Cumplimos con la Ley N° 19.628 de Protección de Datos Personales
        </Text>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyright}>
          © 2024 Manito SpA. Todos los derechos reservados.
        </Text>

        <View style={styles.bottomLinks}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.bottomLinkText}>Privacidad</Text>
          </TouchableOpacity>
          <Text style={styles.bottomLinkDivider}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.bottomLinkText}>Términos</Text>
          </TouchableOpacity>
          <Text style={styles.bottomLinkDivider}>•</Text>
          <TouchableOpacity onPress={handleWebsitePress}>
            <Text style={styles.bottomLinkText}>Sitio Web</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chilean Flag Accent */}
      <View style={styles.flagAccent}>
        <View style={[styles.flagStripe, { backgroundColor: colors.primary[600] }]} />
        <View style={[styles.flagStripe, { backgroundColor: colors.surface.primary }]} />
        <View style={[styles.flagStripe, { backgroundColor: colors.error[500] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[900],
    paddingTop: spacing[12],
    position: 'relative',
  },
  mainContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  companySection: {
    marginBottom: spacing[10],
  },
  logo: {
    fontSize: typography.fontSize['3xl'].size,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    marginBottom: spacing[3],
  },
  tagline: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight * 1.4,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[300],
    marginBottom: spacing[6],
  },
  contactInfo: {
    marginBottom: spacing[6],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  contactText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[300],
    marginLeft: spacing[2],
    lineHeight: typography.fontSize.sm.lineHeight * 1.3,
  },
  socialSection: {
    marginBottom: spacing[6],
  },
  socialTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: "600",
    color: colors.text.inverse,
    marginBottom: spacing[3],
  },
  socialLinks: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  socialLink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 20,
  },
  linksSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  linkColumn: {
    width: '48%',
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: "600",
    color: colors.text.inverse,
    marginBottom: spacing[4],
  },
  linkItem: {
    marginBottom: spacing[3],
  },
  linkText: {
    fontSize: typography.fontSize.sm.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[400],
    lineHeight: typography.fontSize.sm.lineHeight * 1.2,
  },
  complianceSection: {
    backgroundColor: colors.neutral[800],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[700],
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    justifyContent: 'center',
  },
  complianceTitle: {
    fontSize: typography.fontSize.base.size,
    fontWeight: "600",
    color: colors.text.inverse,
    marginLeft: spacing[2],
  },
  complianceBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
    flexWrap: 'wrap',
  },
  complianceBadge: {
    backgroundColor: colors.neutral[700],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  badgeText: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: "600",
    color: colors.neutral[300],
  },
  complianceText: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.fontSize.xs.lineHeight * 1.4,
  },
  bottomBar: {
    backgroundColor: colors.neutral[950],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[800],
    alignItems: 'center',
  },
  copyright: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: typography.fontWeight.regular,
    color: colors.neutral[500],
    marginBottom: spacing[2],
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: typography.fontSize.xs.size,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[400],
  },
  bottomLinkDivider: {
    fontSize: typography.fontSize.xs.size,
    color: colors.neutral[600],
    marginHorizontal: spacing[2],
  },
  flagAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
  },
  flagStripe: {
    flex: 1,
    height: '100%',
  },
});