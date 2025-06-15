export default function TextOverlay({ style }) {
return (
    <div
        style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'transparent',
            background: 'linear-gradient(90deg,rgb(241, 204, 38) 0%,rgb(255, 255, 255) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            fontFamily: 'Brush Script MT, cursive',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            ...style
        }}
    >
        Welcome to the Skies!
    </div>
);
}