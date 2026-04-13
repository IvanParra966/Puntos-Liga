import { useEffect, useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { apiGet } from '../lib/api';

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function parseArrayField(value) {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
}

function normalizeKeyword(keyword) {
    return {
        ...keyword,
        tips: parseArrayField(keyword.tips),
        comparisons: parseArrayField(keyword.comparisons),
    };
}

function buildSearchText(keyword) {
    return [
        keyword.name,
        keyword.reminderText,
        keyword.summary,
        ...(Array.isArray(keyword.tips) ? keyword.tips : []),
        ...(Array.isArray(keyword.comparisons) ? keyword.comparisons : []),
        keyword.funFact,
        keyword.category,
        keyword.interruptive,
        keyword.area,
        keyword.debut,
        keyword.colors,
    ]
        .map(normalizeText)
        .join(' ');
}

function SectionTitle({ children }) {
    return (
        <h3 className="text-base font-bold uppercase tracking-[0.14em] text-cyan-300 sm:text-lg lg:text-xl">
            {children}
        </h3>
    );
}

function BulletList({ items }) {
    if (!Array.isArray(items) || !items.length) return null;

    return (
        <ul className="mt-3 space-y-3 sm:space-y-4">
            {items.map((item, index) => (
                <li
                    key={`${item}-${index}`}
                    className="relative pl-5 text-sm leading-7 text-slate-300 sm:pl-6 sm:text-base sm:leading-8 lg:text-lg"
                >
                    <span className="absolute left-0 top-[10px] h-1.5 w-1.5 rounded-full bg-cyan-300 sm:top-[12px]" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default function KeywordsPage() {
    const [keywords, setKeywords] = useState([]);
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadKeywords = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await apiGet('/api/keywords');

                const normalizedData = Array.isArray(data)
                    ? data.map(normalizeKeyword)
                    : [];

                setKeywords(normalizedData);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar las keywords.');
            } finally {
                setLoading(false);
            }
        };

        loadKeywords();
    }, []);

    const filters = ['Todas', 'Activa Obligatoria', 'Activa Opcional', 'Pasiva'];

    const filteredKeywords = useMemo(() => {
        return keywords.filter((keyword) => {
            const matchesSearch =
                !query || buildSearchText(keyword).includes(normalizeText(query));

            const matchesCategory =
                activeFilter === 'Todas' ||
                normalizeText(keyword.category) === normalizeText(activeFilter);

            return matchesSearch && matchesCategory;
        });
    }, [keywords, query, activeFilter]);

    return (
        <div className="space-y-6 sm:space-y-8">
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-3xl sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300 sm:text-sm sm:tracking-[0.28em]">
                            Base de conocimiento
                        </p>

                        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
                            Keywords
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                            Consultá todas las keywords con su texto recordatorio, explicación,
                            tips, comparaciones y datos extra.
                        </p>
                    </div>

                    <div className="w-full min-w-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:w-auto sm:min-w-[220px]">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                            Total de keywords
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                            {keywords.length}
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4 border-b border-slate-800 pb-6">
                <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar keyword, texto, tip o comparación..."
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 sm:text-base"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => {
                        const active = activeFilter === filter;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                                    active
                                        ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                                }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>

                {!loading && !error ? (
                    <p className="text-sm text-slate-400">
                        Mostrando {filteredKeywords.length} keyword
                        {filteredKeywords.length !== 1 ? 's' : ''}
                    </p>
                ) : null}
            </section>

            {loading ? (
                <div className="py-8 text-sm text-slate-300 sm:text-base">
                    Cargando keywords...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200 sm:text-base">
                    {error}
                </div>
            ) : filteredKeywords.length === 0 ? (
                <div className="py-8 text-sm text-slate-400 sm:text-base">
                    No se encontraron keywords con esos filtros.
                </div>
            ) : (
                <section className="divide-y divide-slate-800">
                    {filteredKeywords.map((keyword) => (
                        <article key={keyword.id} className="py-6 sm:py-8">
                            <div className="max-w-4xl">
                                {/* Titulo */}
                                <div className="mb-3">
                                    <span className="relative inline-flex max-w-full items-center overflow-hidden rounded-full border border-[#c5762c] bg-[#c5762c]/90 px-3 py-1.5 text-sm font-bold tracking-tight text-white sm:px-4 sm:text-xl lg:text-3xl">
                                        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.2)_45%,rgba(0,0,0,0)_100%)]" />
                                        <span className="relative z-10 break-words text-left">
                                            &lt;{keyword.name}&gt;
                                        </span>
                                    </span>
                                </div>

                                {/* Categoria */}
                                <div className="mt-5 w-full rounded-2xl border border-white/10 bg-gray-900/35 p-4 backdrop-blur-sm sm:inline-block sm:w-auto sm:max-w-full sm:p-5 lg:p-6">
                                    <p className="text-sm leading-7 text-slate-200 sm:text-base lg:text-lg">
                                        <strong className="text-red-500">Categoria:</strong>{' '}
                                        {keyword.category}
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-slate-200 sm:mt-3 sm:text-base lg:text-lg">
                                        <strong className="text-red-500">Interruptive:</strong>{' '}
                                        {keyword.interruptive}
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-slate-200 sm:mt-3 sm:text-base lg:text-lg">
                                        <strong className="text-red-500">Area:</strong>{' '}
                                        {keyword.area}
                                    </p>
                                </div>

                                {/* Texto recordatorio */}
                                {keyword.reminderText ? (
                                    <div className="mt-6">
                                        <SectionTitle>Efecto</SectionTitle>
                                        <p className="mt-3 text-base leading-7 text-slate-200 sm:text-lg sm:leading-8 lg:text-xl">
                                            {keyword.reminderText}
                                        </p>
                                    </div>
                                ) : null}

                                {/* Explicación */}
                                {keyword.summary ? (
                                    <div className="mt-6">
                                        <SectionTitle>Explicación</SectionTitle>
                                        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8 lg:text-xl">
                                            {keyword.summary}
                                        </p>
                                    </div>
                                ) : null}

                                {/* Tips */}
                                <div className="mt-6">
                                    <SectionTitle>Tips</SectionTitle>
                                    {Array.isArray(keyword.tips) && keyword.tips.length > 0 ? (
                                        <BulletList items={keyword.tips} />
                                    ) : (
                                        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base lg:text-lg">
                                            Todavía no hay tips cargados para esta keyword.
                                        </p>
                                    )}
                                </div>

                                {/* Comparaciones */}
                                {Array.isArray(keyword.comparisons) &&
                                keyword.comparisons.length > 0 ? (
                                    <div className="mt-6">
                                        <SectionTitle>Comparaciones y aclaraciones</SectionTitle>
                                        <BulletList items={keyword.comparisons} />
                                    </div>
                                ) : null}

                                {/* Dato extra */}
                                {keyword.funFact ? (
                                    <div className="mt-6 border-l-2 border-fuchsia-400/40 pl-4">
                                        <SectionTitle>Dato extra</SectionTitle>
                                        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
                                            {keyword.funFact}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
}