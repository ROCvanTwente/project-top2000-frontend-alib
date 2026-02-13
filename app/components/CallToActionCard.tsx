export default function CallToActionCard() {
    return (
        <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-bold">Stem snel op jou favoriete nummers!</h1>
                <p>Stem op jou favoriete nummers van het afgelopen jaar en help het nummer omhoog te komen in de lijst.</p>
                <button className="bg-red-500 text-white px-5 py-2 rounded-md flex">Stem Nu</button>
            </div>
        </div>
    );
}