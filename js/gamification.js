// gamification.js — XP system, leveling, streaks, combos, titles, particles, sounds

const Gamification = (() => {
    // ===== XP & LEVEL CONFIG =====
    const XP_REWARDS = {
        queryRun: 5,
        exerciseComplete: 50,
        perfectScore: 100,
        noHints: 30,
        speedBonus: 40,        // under 30s
        firstTry: 25,          // no wrong attempts this session
        moduleComplete: 200,
        streakDay: 50,         // per day in streak
        comboBonus: 10,        // per combo level
        dailyFirst: 20,        // first query of the day
    };

    // Level thresholds — each level requires more XP
    // Level 1 = 0 XP, Level 2 = 100 XP, etc.
    function xpForLevel(level) {
        if (level <= 1) return 0;
        return Math.floor(80 * Math.pow(level - 1, 1.5));
    }

    function getLevelFromXP(totalXP) {
        let level = 1;
        while (xpForLevel(level + 1) <= totalXP) level++;
        return level;
    }

    const TITLES = [
        { minLevel: 1, title: 'SQL Newbie', color: '#94a3b8' },
        { minLevel: 3, title: 'Data Curious', color: '#60a5fa' },
        { minLevel: 5, title: 'Query Apprentice', color: '#34d399' },
        { minLevel: 8, title: 'Table Turner', color: '#a78bfa' },
        { minLevel: 12, title: 'Join Journeyman', color: '#f472b6' },
        { minLevel: 16, title: 'Aggregate Ace', color: '#fb923c' },
        { minLevel: 20, title: 'Subquery Sage', color: '#facc15' },
        { minLevel: 25, title: 'Index Wizard', color: '#2dd4bf' },
        { minLevel: 30, title: 'Schema Architect', color: '#c084fc' },
        { minLevel: 35, title: 'Database Overlord', color: '#f87171' },
        { minLevel: 40, title: 'SQL Grandmaster', color: '#fbbf24' },
        { minLevel: 50, title: 'Legendary DBA', color: '#ff6b6b' },
    ];

    function getTitle(level) {
        let title = TITLES[0];
        for (const t of TITLES) {
            if (level >= t.minLevel) title = t;
        }
        return title;
    }

    // ===== COMBO SYSTEM =====
    let currentCombo = 0;
    let maxCombo = 0;

    function addCombo() {
        currentCombo++;
        if (currentCombo > maxCombo) maxCombo = currentCombo;
        return currentCombo;
    }

    function breakCombo() {
        const was = currentCombo;
        currentCombo = 0;
        return was;
    }

    function getCombo() {
        return currentCombo;
    }

    function getComboMultiplier() {
        if (currentCombo < 2) return 1;
        if (currentCombo < 5) return 1.5;
        if (currentCombo < 10) return 2;
        if (currentCombo < 20) return 3;
        return 5;
    }

    // ===== STREAK SYSTEM =====
    function checkAndUpdateStreak() {
        const data = Progress.load();
        if (!data.gamification) data.gamification = getDefaultGamification();

        const today = new Date().toISOString().split('T')[0];
        const lastActive = data.gamification.lastActiveDate;

        if (lastActive === today) {
            return { streakDays: data.gamification.streakDays, isNewDay: false };
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (lastActive === yesterday) {
            data.gamification.streakDays++;
        } else if (lastActive !== today) {
            data.gamification.streakDays = 1;
        }

        data.gamification.lastActiveDate = today;
        data.gamification.totalDaysActive = (data.gamification.totalDaysActive || 0) + 1;
        Progress.save(data);

        return { streakDays: data.gamification.streakDays, isNewDay: true };
    }

    // ===== XP AWARDING =====
    function awardXP(amount, reason) {
        const multiplier = getComboMultiplier();
        const finalXP = Math.round(amount * multiplier);

        const data = Progress.load();
        if (!data.gamification) data.gamification = getDefaultGamification();

        const oldLevel = getLevelFromXP(data.gamification.totalXP);
        data.gamification.totalXP += finalXP;
        const newLevel = getLevelFromXP(data.gamification.totalXP);

        // Track session XP
        data.gamification.sessionXP = (data.gamification.sessionXP || 0) + finalXP;

        Progress.save(data);

        const leveledUp = newLevel > oldLevel;

        return {
            xpGained: finalXP,
            baseXP: amount,
            multiplier,
            totalXP: data.gamification.totalXP,
            oldLevel,
            newLevel,
            leveledUp,
            reason,
            title: getTitle(newLevel),
            xpToNext: xpForLevel(newLevel + 1) - data.gamification.totalXP,
            xpInLevel: data.gamification.totalXP - xpForLevel(newLevel),
            xpLevelRange: xpForLevel(newLevel + 1) - xpForLevel(newLevel),
        };
    }

    // ===== DEFAULT GAMIFICATION DATA =====
    function getDefaultGamification() {
        return {
            totalXP: 0,
            sessionXP: 0,
            streakDays: 0,
            lastActiveDate: null,
            totalDaysActive: 0,
            longestStreak: 0,
            maxCombo: 0,
            totalCombos: 0,
            exerciseAttempts: {},  // lessonKey -> attempt count this session
        };
    }

    // ===== EXERCISE XP CALCULATION =====
    function calculateExerciseXP(passed, score, hintsUsed, elapsedSeconds, isFirstAttempt) {
        if (!passed) return [];

        const rewards = [];

        rewards.push({ amount: XP_REWARDS.exerciseComplete, reason: 'Exercise Complete' });

        if (score === 100) {
            rewards.push({ amount: XP_REWARDS.perfectScore, reason: 'Perfect Score' });
        }

        if (hintsUsed === 0) {
            rewards.push({ amount: XP_REWARDS.noHints, reason: 'No Hints Used' });
        }

        if (elapsedSeconds < 30) {
            rewards.push({ amount: XP_REWARDS.speedBonus, reason: 'Speed Bonus (<30s)' });
        }

        if (isFirstAttempt) {
            rewards.push({ amount: XP_REWARDS.firstTry, reason: 'First Try' });
        }

        return rewards;
    }

    // ===== PARTICLE EFFECTS =====
    function spawnParticles(x, y, count, colors, type) {
        const container = document.getElementById('particle-container');
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${type || 'default'}`;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const velocity = 80 + Math.random() * 120;
            const size = 4 + Math.random() * 6;

            particle.style.cssText = `
                left: ${x}px; top: ${y}px;
                width: ${size}px; height: ${size}px;
                background: ${color};
                --tx: ${Math.cos(angle) * velocity}px;
                --ty: ${Math.sin(angle) * velocity - 40}px;
            `;

            container.appendChild(particle);
            setTimeout(() => particle.remove(), 800);
        }
    }

    function spawnConfetti(centerX, centerY) {
        const colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb923c', '#ef4444'];
        spawnParticles(centerX, centerY, 40, colors, 'confetti');
    }

    function spawnXPParticles(x, y) {
        spawnParticles(x, y, 12, ['#fbbf24', '#facc15', '#fde68a'], 'xp');
    }

    function spawnComboParticles(x, y) {
        const colors = currentCombo >= 10 ? ['#ef4444', '#f97316', '#fbbf24'] :
                       currentCombo >= 5 ? ['#a78bfa', '#c084fc', '#e879f9'] :
                       ['#60a5fa', '#818cf8', '#a78bfa'];
        spawnParticles(x, y, 8 + currentCombo * 2, colors, 'combo');
    }

    // ===== FLOATING TEXT =====
    function showFloatingText(text, x, y, color, size) {
        const container = document.getElementById('particle-container');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.cssText = `
            left: ${x}px; top: ${y}px;
            color: ${color || '#fbbf24'};
            font-size: ${size || 18}px;
        `;
        container.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }

    // ===== SOUND EFFECTS (Web Audio API) =====
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        return audioCtx;
    }

    function playSound(type) {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.08, now);

        switch (type) {
            case 'xp':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'levelup':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'combo':
                osc.type = 'square';
                const pitch = 300 + currentCombo * 50;
                osc.frequency.setValueAtTime(pitch, now);
                osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.08);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
                break;

            case 'fail':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;

            case 'achievement':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, now);        // C5
                osc.frequency.setValueAtTime(659, now + 0.1);  // E5
                osc.frequency.setValueAtTime(784, now + 0.2);  // G5
                osc.frequency.setValueAtTime(1047, now + 0.3); // C6
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
        }
    }

    // ===== SCREEN SHAKE =====
    function screenShake(intensity) {
        const main = document.getElementById('main-content');
        if (!main) return;
        main.classList.add('screen-shake');
        main.style.setProperty('--shake-intensity', `${intensity}px`);
        setTimeout(() => main.classList.remove('screen-shake'), 300);
    }

    // ===== DAILY CHALLENGES =====
    function getDailyChallenge() {
        // Deterministic based on date
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);

        const challenges = [
            { id: 'run_10', title: 'Query Runner', desc: 'Run 10 queries today', target: 10, type: 'queries', xp: 100 },
            { id: 'perfect_3', title: 'Triple Perfection', desc: 'Get 3 perfect scores today', target: 3, type: 'perfects', xp: 150 },
            { id: 'combo_5', title: 'Combo Builder', desc: 'Reach a 5x combo', target: 5, type: 'combo', xp: 120 },
            { id: 'complete_5', title: 'Lesson Blitz', desc: 'Complete 5 exercises today', target: 5, type: 'exercises', xp: 130 },
            { id: 'no_hints_3', title: 'Solo Scholar', desc: 'Complete 3 exercises without hints', target: 3, type: 'no_hints', xp: 140 },
            { id: 'speed_3', title: 'Speed Run', desc: 'Complete 3 exercises under 30s each', target: 3, type: 'speed', xp: 160 },
            { id: 'run_20', title: 'Query Marathon', desc: 'Run 20 queries today', target: 20, type: 'queries', xp: 120 },
        ];

        return { ...challenges[seed % challenges.length], date: today };
    }

    function getDailyChallengeProgress() {
        const data = Progress.load();
        if (!data.gamification) return { current: 0, completed: false };

        const challenge = getDailyChallenge();
        const dp = data.gamification.dailyProgress || {};
        if (dp.date !== challenge.date) return { current: 0, completed: false };

        return {
            current: dp[challenge.type] || 0,
            completed: dp.completed || false
        };
    }

    function updateDailyProgress(type, increment) {
        const data = Progress.load();
        if (!data.gamification) data.gamification = getDefaultGamification();

        const challenge = getDailyChallenge();
        if (!data.gamification.dailyProgress || data.gamification.dailyProgress.date !== challenge.date) {
            data.gamification.dailyProgress = { date: challenge.date };
        }

        const dp = data.gamification.dailyProgress;
        dp[type] = (dp[type] || 0) + (increment || 1);

        // Check if challenge completed
        if (!dp.completed && challenge.type === type && dp[type] >= challenge.target) {
            dp.completed = true;
            Progress.save(data);
            return { justCompleted: true, challenge };
        }

        Progress.save(data);
        return { justCompleted: false };
    }

    // ===== ENHANCED ACHIEVEMENTS =====
    const ENHANCED_ACHIEVEMENTS = [
        // Common
        { id: 'first_query', name: 'Hello World', desc: 'Run your first SQL query', icon: '🚀', rarity: 'common', xp: 10 },
        { id: 'ten_queries', name: 'Getting Warmed Up', desc: 'Run 10 queries', icon: '🔥', rarity: 'common', xp: 25 },
        { id: 'first_exercise', name: 'First Steps', desc: 'Complete your first exercise', icon: '🎯', rarity: 'common', xp: 25 },
        { id: 'module_1', name: 'SQL Beginner', desc: 'Complete Module 1', icon: '📗', rarity: 'common', xp: 50 },

        // Uncommon
        { id: 'fifty_queries', name: 'Query Machine', desc: 'Run 50 queries', icon: '⚡', rarity: 'uncommon', xp: 50 },
        { id: 'perfect_score', name: 'Perfectionist', desc: 'Get 100% without hints', icon: '⭐', rarity: 'uncommon', xp: 50 },
        { id: 'combo_5', name: 'Combo Starter', desc: 'Reach a 5x combo', icon: '🔗', rarity: 'uncommon', xp: 50 },
        { id: 'module_3', name: 'Getting Comfortable', desc: 'Complete 3 modules', icon: '📘', rarity: 'uncommon', xp: 75 },
        { id: 'streak_3', name: 'Three-Peat', desc: 'Maintain a 3-day streak', icon: '📅', rarity: 'uncommon', xp: 60 },
        { id: 'daily_challenge', name: 'Daily Warrior', desc: 'Complete a daily challenge', icon: '🗡️', rarity: 'uncommon', xp: 50 },

        // Rare
        { id: 'hundred_queries', name: 'SQL Enthusiast', desc: 'Run 100 queries', icon: '💯', rarity: 'rare', xp: 100 },
        { id: 'five_perfect', name: 'Star Student', desc: 'Get 5 perfect scores', icon: '🌟', rarity: 'rare', xp: 100 },
        { id: 'combo_10', name: 'Combo Master', desc: 'Reach a 10x combo', icon: '⛓️', rarity: 'rare', xp: 100 },
        { id: 'module_6', name: 'Halfway There', desc: 'Complete 6 modules', icon: '📙', rarity: 'rare', xp: 150 },
        { id: 'no_hints_module', name: 'Independent', desc: 'Complete a module without any hints', icon: '🧠', rarity: 'rare', xp: 150 },
        { id: 'streak_7', name: 'Weekly Warrior', desc: 'Maintain a 7-day streak', icon: '🗓️', rarity: 'rare', xp: 120 },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete an exercise in under 30s', icon: '⏱️', rarity: 'rare', xp: 75 },
        { id: 'level_10', name: 'Double Digits', desc: 'Reach level 10', icon: '🔟', rarity: 'rare', xp: 100 },
        { id: 'daily_3', name: 'Challenge Accepted', desc: 'Complete 3 daily challenges', icon: '⚔️', rarity: 'rare', xp: 100 },

        // Epic
        { id: 'five_hundred_queries', name: 'Query Legend', desc: 'Run 500 queries', icon: '🏅', rarity: 'epic', xp: 200 },
        { id: 'module_9', name: 'Almost Expert', desc: 'Complete 9 modules', icon: '📕', rarity: 'epic', xp: 250 },
        { id: 'combo_20', name: 'Unstoppable', desc: 'Reach a 20x combo', icon: '💥', rarity: 'epic', xp: 250 },
        { id: 'streak_14', name: 'Fortnight Focus', desc: 'Maintain a 14-day streak', icon: '🔥', rarity: 'epic', xp: 200 },
        { id: 'level_25', name: 'Quarter Century', desc: 'Reach level 25', icon: '👑', rarity: 'epic', xp: 200 },
        { id: 'ten_perfect', name: 'Flawless Record', desc: 'Get 10 perfect scores', icon: '💎', rarity: 'epic', xp: 200 },
        { id: 'explorer', name: 'Explorer', desc: 'Visit all 12 modules', icon: '🗺️', rarity: 'epic', xp: 150 },
        { id: 'daily_7', name: 'Challenge Champion', desc: 'Complete 7 daily challenges', icon: '🛡️', rarity: 'epic', xp: 200 },

        // Legendary
        { id: 'all_modules', name: 'SQL Master', desc: 'Complete all 12 modules', icon: '🏆', rarity: 'legendary', xp: 500 },
        { id: 'level_40', name: 'Grandmaster', desc: 'Reach level 40', icon: '👁️', rarity: 'legendary', xp: 400 },
        { id: 'thousand_queries', name: 'Query God', desc: 'Run 1000 queries', icon: '⚡', rarity: 'legendary', xp: 500 },
        { id: 'streak_30', name: 'Monthly Devotion', desc: 'Maintain a 30-day streak', icon: '🌟', rarity: 'legendary', xp: 500 },
        { id: 'night_owl', name: 'Night Owl', desc: 'Study after midnight', icon: '🦉', rarity: 'legendary', xp: 100 },
        { id: 'all_perfect', name: 'Absolute Perfection', desc: 'Perfect score on every exercise', icon: '💠', rarity: 'legendary', xp: 1000 },
    ];

    function getEnhancedAchievements() {
        const data = Progress.load();
        return ENHANCED_ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: data.achievements.includes(a.id)
        }));
    }

    function checkEnhancedAchievements() {
        const data = Progress.load();
        if (!data.gamification) data.gamification = getDefaultGamification();
        const newAchievements = [];

        function unlock(id) {
            if (!data.achievements.includes(id)) {
                data.achievements.push(id);
                const ach = ENHANCED_ACHIEVEMENTS.find(a => a.id === id);
                if (ach) {
                    newAchievements.push(ach);
                    // Award achievement XP
                    data.gamification.totalXP += (ach.xp || 0);
                }
            }
        }

        // Query counts
        if (data.totalQueriesRun >= 1) unlock('first_query');
        if (data.totalQueriesRun >= 10) unlock('ten_queries');
        if (data.totalQueriesRun >= 50) unlock('fifty_queries');
        if (data.totalQueriesRun >= 100) unlock('hundred_queries');
        if (data.totalQueriesRun >= 500) unlock('five_hundred_queries');
        if (data.totalQueriesRun >= 1000) unlock('thousand_queries');

        // Exercises
        if (data.exercisesCompleted >= 1) unlock('first_exercise');
        if (data.perfectScores >= 1) unlock('perfect_score');
        if (data.perfectScores >= 5) unlock('five_perfect');
        if (data.perfectScores >= 10) unlock('ten_perfect');

        // Combos
        if (maxCombo >= 5 || data.gamification.maxCombo >= 5) unlock('combo_5');
        if (maxCombo >= 10 || data.gamification.maxCombo >= 10) unlock('combo_10');
        if (maxCombo >= 20 || data.gamification.maxCombo >= 20) unlock('combo_20');

        // Save max combo
        if (maxCombo > (data.gamification.maxCombo || 0)) {
            data.gamification.maxCombo = maxCombo;
        }

        // Streaks
        const streak = data.gamification.streakDays || 0;
        if (streak > (data.gamification.longestStreak || 0)) {
            data.gamification.longestStreak = streak;
        }
        if (data.gamification.longestStreak >= 3) unlock('streak_3');
        if (data.gamification.longestStreak >= 7) unlock('streak_7');
        if (data.gamification.longestStreak >= 14) unlock('streak_14');
        if (data.gamification.longestStreak >= 30) unlock('streak_30');

        // Levels
        const level = getLevelFromXP(data.gamification.totalXP);
        if (level >= 10) unlock('level_10');
        if (level >= 25) unlock('level_25');
        if (level >= 40) unlock('level_40');

        // Daily challenges
        const dailiesCompleted = data.gamification.dailyChallengesCompleted || 0;
        if (dailiesCompleted >= 1) unlock('daily_challenge');
        if (dailiesCompleted >= 3) unlock('daily_3');
        if (dailiesCompleted >= 7) unlock('daily_7');

        // Module completions
        if (typeof Progress.isModuleComplete === 'function') {
            if (Progress.isModuleComplete(1)) unlock('module_1');
            let completedModules = 0;
            for (let i = 1; i <= 12; i++) {
                if (Progress.isModuleComplete(i)) completedModules++;
            }
            if (completedModules >= 3) unlock('module_3');
            if (completedModules >= 6) unlock('module_6');
            if (completedModules >= 9) unlock('module_9');
            if (completedModules >= 12) unlock('all_modules');

            // No hints module
            for (let i = 1; i <= 12; i++) {
                if (!Progress.isModuleComplete(i)) continue;
                const mod = CURRICULUM?.find(m => m.moduleId === i);
                if (!mod) continue;
                let noHints = true;
                mod.lessons.forEach(l => {
                    if (l.exercise) {
                        const lp = data.modules[i]?.lessons?.[l.lessonId];
                        if (lp && lp.hintsUsed > 0) noHints = false;
                    }
                });
                if (noHints) { unlock('no_hints_module'); break; }
            }

            // All perfect check
            if (completedModules >= 12) {
                let allPerfect = true;
                CURRICULUM.forEach(mod => {
                    mod.lessons.forEach(l => {
                        if (l.exercise) {
                            const lp = data.modules[mod.moduleId]?.lessons?.[l.lessonId];
                            if (!lp || lp.score < 100) allPerfect = false;
                        }
                    });
                });
                if (allPerfect) unlock('all_perfect');
            }
        }

        // Explorer
        if (data.modulesVisited && data.modulesVisited.length >= 12) unlock('explorer');

        // Night owl
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) unlock('night_owl');

        Progress.save(data);
        return newAchievements;
    }

    // ===== STATS =====
    function getStats() {
        const data = Progress.load();
        const g = data.gamification || getDefaultGamification();
        const level = getLevelFromXP(g.totalXP);
        const title = getTitle(level);

        return {
            totalXP: g.totalXP,
            level,
            title,
            xpToNext: xpForLevel(level + 1) - g.totalXP,
            xpInLevel: g.totalXP - xpForLevel(level),
            xpLevelRange: xpForLevel(level + 1) - xpForLevel(level),
            streakDays: g.streakDays || 0,
            longestStreak: g.longestStreak || 0,
            maxCombo: g.maxCombo || 0,
            totalDaysActive: g.totalDaysActive || 0,
            totalQueriesRun: data.totalQueriesRun || 0,
            exercisesCompleted: data.exercisesCompleted || 0,
            perfectScores: data.perfectScores || 0,
            achievementsUnlocked: data.achievements?.length || 0,
            achievementsTotal: ENHANCED_ACHIEVEMENTS.length,
            dailyChallengesCompleted: g.dailyChallengesCompleted || 0,
        };
    }

    // ===== PUBLIC API =====
    return {
        // XP & Leveling
        awardXP, getLevelFromXP, getTitle, xpForLevel,
        calculateExerciseXP, getStats, XP_REWARDS,

        // Combo
        addCombo, breakCombo, getCombo, getComboMultiplier,

        // Streak
        checkAndUpdateStreak,

        // Daily Challenges
        getDailyChallenge, getDailyChallengeProgress, updateDailyProgress,

        // Achievements
        ENHANCED_ACHIEVEMENTS, getEnhancedAchievements, checkEnhancedAchievements,

        // Effects
        spawnConfetti, spawnXPParticles, spawnComboParticles,
        showFloatingText, playSound, screenShake,

        // Data
        getDefaultGamification,
    };
})();
