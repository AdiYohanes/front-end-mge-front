// src/pages/ProfileRewardsPage.jsx
import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import publicApiClient from "../lib/publicApiClient";

const mockUserRewards = [
    { id: "r1", title: "Gratis Coca-cola", desc: "Gratis 1 kaleng Coca-cola ukuran 250ml.", daysLeft: 6, used: false, image: "/images/coin.png" },
    { id: "r2", title: "Gratis Coca-cola", desc: "Gratis 1 kaleng Coca-cola ukuran 250ml.", daysLeft: 6, used: true, image: "/images/coin.png" },
    { id: "r3", title: "Gratis Coca-cola", desc: "Gratis 1 kaleng Coca-cola ukuran 250ml.", daysLeft: 6, used: false, image: "/images/coin.png" },
];

// Available rewards will be fetched from API

const categoryList = ["All", "Food & Drinks", "Room"];

const ProfileRewardsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const userPoints = user?.total_points || 0;
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeCategory, setActiveCategory] = React.useState("All");
    const [availableRewards, setAvailableRewards] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSelectCategory = (cat) => setActiveCategory(cat);

    const renderHeader = () => {
        return (
            <div className="flex flex-col items-center gap-3 text-center">
                <h1 className="font-minecraft text-4xl text-theme-primary">Rewards</h1>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-10 rounded bg-brand-gold" aria-hidden="true"></div>
                    <div className="h-3 w-10 rounded bg-theme-primary" aria-hidden="true"></div>
                    <div className="h-3 w-10 rounded bg-brand-gold" aria-hidden="true"></div>
                </div>
                <div className="text-sm text-theme-secondary">
                    <span className="inline-flex items-center gap-2">
                        <img src="/images/coin.png" alt="points" className="h-5 w-5" />
                        <strong className="text-theme-primary">{userPoints} points</strong>
                    </span>
                    <div className="mt-1">Expired on August 12, 2025</div>
                </div>
            </div>
        );
    };

    const RewardCard = ({ item, actionLabel }) => {
        return (
            <div className="card bg-theme-primary border border-theme shadow-md">
                <figure className="h-40 overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </figure>
                <div className="card-body p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="card-title text-base text-theme-primary">{item.title}</h3>
                        {item.daysLeft ? (
                            <span className="badge badge-outline text-xs">{item.daysLeft} days</span>
                        ) : null}
                    </div>
                    <p className="text-xs text-theme-secondary leading-snug">{item.desc}</p>
                    <div className="card-actions mt-2">
                        <button
                            className="btn btn-sm bg-brand-gold hover:bg-yellow-600 text-white w-full disabled:opacity-60"
                            disabled={item.used}
                            aria-disabled={item.used}
                        >
                            {item.used ? "Used" : actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const AvailableRewardCard = ({ item }) => {
        return (
            <div className="card bg-theme-primary border border-theme shadow-md">
                <figure className="h-40 overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </figure>
                <div className="card-body p-4 gap-3">
                    <h3 className="card-title text-base text-theme-primary">{item.title}</h3>
                    <p className="text-xs text-theme-secondary leading-snug">{item.desc}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                            <img src="/images/coin.png" alt="point" className="h-4 w-4" />
                            <span>{item.points} Point</span>
                        </div>
                        <button className="btn btn-sm bg-brand-gold hover:bg-yellow-600 text-white">Redeem</button>
                    </div>
                </div>
            </div>
        );
    };

    const filteredAvailable = availableRewards.filter((rw) => {
        const byCat = activeCategory === "All" || rw.category === activeCategory;
        const byText = rw.title.toLowerCase().includes(searchQuery.toLowerCase());
        return byCat && byText;
    });

    React.useEffect(() => {
        const loadAvailable = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await publicApiClient.get("/api/public/rewards");
                const list = Array.isArray(res.data) ? res.data : [];
                const normalized = list.map((r) => {
                    const type = r?.effects?.type;
                    const category = type === "free_fnb" ? "Food & Drinks" : type === "free_play" ? "Room" : "All";
                    return {
                        id: r.id,
                        title: r.name,
                        desc: r.description,
                        points: r.points_required,
                        category,
                        type,
                        image: r.image || (type === "free_play" ? "/images/roomsnya.jpg" : "/images/coin.png"),
                    };
                });
                setAvailableRewards(normalized);
            } catch {
                setError("Failed to load rewards");
            } finally {
                setLoading(false);
            }
        };
        loadAvailable();
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            {renderHeader()}

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-theme-primary">Your Reward</h2>
                    <Link to="/profile" className="link text-sm">
                        Back to Profile
                    </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockUserRewards.map((item) => (
                        <RewardCard key={item.id} item={item} actionLabel="Use Now" />
                    ))}
                </div>
            </div>

            <div className="mt-10">
                <h2 className="font-semibold text-theme-primary">Available Rewards</h2>

                <div className="mt-4 flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Find rewards..."
                            className="input input-bordered w-full bg-theme-primary"
                            aria-label="Search rewards"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary">
                            🔍
                        </span>
                    </div>

                    <div className="tabs tabs-boxed bg-transparent p-0">
                        <div className="flex gap-2">
                            {categoryList.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleSelectCategory(cat)}
                                    className={
                                        "btn btn-sm " +
                                        (activeCategory === cat
                                            ? "bg-brand-gold text-white"
                                            : "bg-theme-primary border border-theme text-theme-primary")
                                    }
                                    aria-pressed={activeCategory === cat}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-56 bg-base-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="mt-4 text-error">{error}</p>
                ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAvailable.map((item) => (
                            <AvailableRewardCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileRewardsPage;


