import Carousel from './customUI/Carousel';

export default function Hero() {
    const carouselSlides = [
        {
        image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjQ2MzUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        title: 'DE GROOTSTE HITS ALLER TIJDEN',
        subtitle: 'Meer dan 25 jaar muziekgeschiedenis in één lijst',
        badge: 'TOP2000 2024',
        icon: 'trophy'
        },
        {
        image: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZHMlMjBtdXNpY3xlbnwxfHx8fDE3NjQ2MzY0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        title: 'STEM OP JE FAVORIETE NUMMERS',
        subtitle: 'Bepaal mee welke hits in de TOP2000 van 2025 komen',
        badge: 'Vote Now',
        icon: 'sparkles'
        },
        {
        image: 'https://images.unsplash.com/photo-1758272248920-a39302af6d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMHJhZGlvJTIwbXVzaWN8ZW58MXx8fHwxNzY0Njc4MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        title: 'JOUW FAVORIETEN IN ÉÉN PLAYLIST',
        subtitle: 'Bewaar en deel je ultieme TOP2000 selectie',
        badge: 'Create',
        icon: 'heart'
        }
    ];

    return (
        <div className="w-full m-0">
            <Carousel slides={carouselSlides} />
        </div>
    );
}