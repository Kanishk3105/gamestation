import React from 'react';

const Footer: React.FC = () => {
  const styles = {
    footer: {
      backgroundColor: '#0a0a0f',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '48px 24px',
      color: 'rgba(255, 255, 255, 0.4)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
    },
    logo: {
      fontSize: '24px',
      fontWeight: 700,
      letterSpacing: '2px',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '8px',
    },
    tagline: {
      fontSize: '14px',
      marginBottom: '32px',
    },
    linksContainer: {
      display: 'flex',
      gap: '24px',
      marginBottom: '32px',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
    },
    link: {
      color: 'rgba(255, 255, 255, 0.4)',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'color 0.2s',
    },
    bottomRow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      fontSize: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      paddingTop: '24px',
      width: '100%',
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.logo}>GAMESTATION</div>
        <div style={styles.tagline}>Premium gaming console rentals</div>
        
        <div style={styles.linksContainer}>
          <a href="#" style={styles.link}>Catalog</a>
          <a href="#" style={styles.link}>About</a>
          <a href="#" style={styles.link}>FAQ</a>
          <a href="#" style={styles.link}>Contact</a>
        </div>
        
        <div style={styles.bottomRow}>
          <div>&copy; 2024 GameStation. All rights reserved.</div>
          <div>Built with ❤️ for gamers</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
