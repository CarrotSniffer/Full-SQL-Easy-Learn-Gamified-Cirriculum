// progress.js — localStorage CRUD, achievements, scoring

const Progress = (() => {
    const STORAGE_KEY = 'sql_bootcamp_progress';

    // Achievements are now managed by Gamification.ENHANCED_ACHIEVEMENTS
    // Keep a reference for backward compatibility
    const ACHIEVEMENTS = typeof Gamification !== 'undefined'
        ? Gamification.ENHANCED_ACHIEVEMENTS
        : [];

    function getDefault() {
        return {
            version: 1,
            theme: 'dark',
            currentModule: null,
            currentLesson: null,
            modules: {},
            achievements: [],
            totalQueriesRun: 0,
            perfectScores: 0,
            modulesVisited: [],
            exercisesCompleted: 0,
            gamification: typeof Gamification !== 'undefined'
                ? Gamification.getDefaultGamification()
                : { totalXP: 0, streakDays: 0, lastActiveDate: null, totalDaysActive: 0,
                    longestStreak: 0, maxCombo: 0, sessionXP: 0, dailyChallengesCompleted: 0 }
        };
    }

    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Merge with defaults for forward compatibility
                return { ...getDefault(), ...data };
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
        return getDefault();
    }

    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }

    function getLessonProgress(moduleId, lessonId) {
        const data = load();
        const mod = data.modules[moduleId];
        if (!mod || !mod.lessons) return null;
        return mod.lessons[lessonId] || null;
    }

    function saveLessonProgress(moduleId, lessonId, result) {
        const data = load();
        if (!data.modules[moduleId]) {
            data.modules[moduleId] = { lessons: {} };
        }
        const existing = data.modules[moduleId].lessons[lessonId];
        // Keep best score
        if (existing && existing.score >= result.score) {
            data.modules[moduleId].lessons[lessonId] = {
                ...existing,
                completed: true,
                attempts: (existing.attempts || 0) + 1
            };
        } else {
            data.modules[moduleId].lessons[lessonId] = {
                completed: true,
                score: result.score,
                hintsUsed: result.hintsUsed,
                attempts: (existing ? existing.attempts || 0 : 0) + 1,
                completedAt: new Date().toISOString()
            };
        }
        data.exercisesCompleted = (data.exercisesCompleted || 0) + 1;
        save(data);
        return data;
    }

    function recordQuery() {
        const data = load();
        data.totalQueriesRun = (data.totalQueriesRun || 0) + 1;
        save(data);
        return data;
    }

    function recordPerfectScore() {
        const data = load();
        data.perfectScores = (data.perfectScores || 0) + 1;
        save(data);
        return data;
    }

    function recordModuleVisit(moduleId) {
        const data = load();
        if (!data.modulesVisited) data.modulesVisited = [];
        if (!data.modulesVisited.includes(moduleId)) {
            data.modulesVisited.push(moduleId);
        }
        save(data);
        return data;
    }

    function savePosition(moduleId, lessonId) {
        const data = load();
        data.currentModule = moduleId;
        data.currentLesson = lessonId;
        save(data);
    }

    function saveTheme(theme) {
        const data = load();
        data.theme = theme;
        save(data);
    }

    function getOverallProgress() {
        const data = load();
        let totalExercises = 0;
        let completedExercises = 0;

        if (typeof CURRICULUM !== 'undefined') {
            CURRICULUM.forEach(mod => {
                mod.lessons.forEach(lesson => {
                    if (lesson.exercise) {
                        totalExercises++;
                        const lp = data.modules[mod.moduleId]?.lessons?.[lesson.lessonId];
                        if (lp && lp.completed) completedExercises++;
                    }
                });
            });
        }

        return totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    }

    function getModuleProgress(moduleId) {
        const data = load();
        const mod = CURRICULUM?.find(m => m.moduleId === moduleId);
        if (!mod) return { completed: 0, total: 0, percent: 0 };

        let total = 0;
        let completed = 0;
        mod.lessons.forEach(lesson => {
            if (lesson.exercise) {
                total++;
                const lp = data.modules[moduleId]?.lessons?.[lesson.lessonId];
                if (lp && lp.completed) completed++;
            }
        });

        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }

    function isModuleComplete(moduleId) {
        const p = getModuleProgress(moduleId);
        return p.total > 0 && p.completed === p.total;
    }

    function checkAchievements() {
        if (typeof Gamification !== 'undefined') {
            return Gamification.checkEnhancedAchievements();
        }
        return [];
    }

    function getAchievements() {
        if (typeof Gamification !== 'undefined') {
            return Gamification.getEnhancedAchievements();
        }
        return [];
    }

    function resetProgress() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function hasProgress() {
        const data = load();
        return data.currentModule !== null || data.totalQueriesRun > 0;
    }

    return {
        load, save, getLessonProgress, saveLessonProgress,
        recordQuery, recordPerfectScore, recordModuleVisit,
        savePosition, saveTheme, getOverallProgress, getModuleProgress,
        isModuleComplete, checkAchievements, getAchievements,
        resetProgress, hasProgress, ACHIEVEMENTS
    };
})();
