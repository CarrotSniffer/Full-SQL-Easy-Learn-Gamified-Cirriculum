// app.js — Application bootstrap, routing, theme toggle, event wiring

const App = (() => {
    let currentModule = null;
    let currentLesson = null;
    let exerciseAttempts = {};  // track attempts per lesson key this session

    async function init() {
        showLoadingState();

        try {
            await Database.init();
        } catch (e) {
            document.getElementById('main-content').innerHTML =
                `<div style="padding:40px;text-align:center;color:var(--error);">
                    <h2>Failed to load SQL engine</h2>
                    <p>Please check your internet connection (sql.js loads from CDN).</p>
                    <p style="font-size:13px;color:var(--text-muted);">${e.message}</p>
                </div>`;
            return;
        }

        Editor.init();
        loadTheme();
        setupEventListeners();
        UI.renderSidebar();
        UI.updateProgressBar();

        // Initialize streak
        const streak = Gamification.checkAndUpdateStreak();
        if (streak.isNewDay && streak.streakDays > 1) {
            const xpResult = Gamification.awardXP(
                Gamification.XP_REWARDS.streakDay * Math.min(streak.streakDays, 7),
                `${streak.streakDays}-Day Streak`
            );
            UI.updateXPBar();
            setTimeout(() => {
                UI.showToast(`${streak.streakDays}-day streak! +${xpResult.xpGained} XP`, 'achievement', '&#128293;');
            }, 1000);
        }

        // Check for saved position or hash route
        const hash = parseHash();
        if (hash) {
            navigateTo(hash.moduleId, hash.lessonId);
        } else {
            showWelcome();
        }

        hideLoadingState();
    }

    function showLoadingState() {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('lesson-view').style.display = 'none';
    }

    function hideLoadingState() {
        // Content will be shown by navigateTo or showWelcome
    }

    function showWelcome() {
        document.getElementById('welcome-screen').style.display = 'flex';
        document.getElementById('lesson-view').style.display = 'none';

        const hasProgress = Progress.hasProgress();
        document.getElementById('start-learning-btn').style.display = hasProgress ? 'none' : 'inline-flex';
        document.getElementById('continue-learning-btn').style.display = hasProgress ? 'inline-flex' : 'none';
    }

    function navigateTo(moduleId, lessonId) {
        currentModule = moduleId;
        currentLesson = lessonId;

        window.location.hash = `module/${moduleId}/lesson/${lessonId}`;
        Progress.savePosition(moduleId, lessonId);
        Progress.recordModuleVisit(moduleId);

        UI.renderLesson(moduleId, lessonId);
        UI.renderSidebar();
        UI.updateProgressBar();

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
    }

    function parseHash() {
        const hash = window.location.hash;
        const match = hash.match(/^#module\/(\d+)\/lesson\/(\d+)$/);
        if (match) {
            return { moduleId: parseInt(match[1]), lessonId: parseInt(match[2]) };
        }

        const data = Progress.load();
        if (data.currentModule && data.currentLesson) {
            return { moduleId: data.currentModule, lessonId: data.currentLesson };
        }

        return null;
    }

    function setupEventListeners() {
        // Run query
        document.getElementById('run-btn').addEventListener('click', handleRunQuery);

        // Reset editor
        document.getElementById('reset-btn').addEventListener('click', () => {
            const mod = CURRICULUM.find(m => m.moduleId === currentModule);
            const lesson = mod?.lessons.find(l => l.lessonId === currentLesson);
            if (lesson?.exercise?.startingCode) {
                Editor.setValue(lesson.exercise.startingCode);
            } else {
                Editor.setValue('-- Write your SQL query here\n');
            }
            document.getElementById('exercise-feedback').style.display = 'none';
            Database.resetDatabase();
            UI.showToast('Database reset to original state.', 'success', '&#x21bb;');
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            const mod = CURRICULUM.find(m => m.moduleId === currentModule);
            const lesson = mod?.lessons.find(l => l.lessonId === currentLesson);
            if (lesson?.exercise?.hints) {
                const count = Exercises.revealNextHint(lesson.exercise.hints);
                UI.renderHint(lesson.exercise.hints, count);
            }
        });

        // Solution button
        document.getElementById('solution-btn').addEventListener('click', () => {
            const mod = CURRICULUM.find(m => m.moduleId === currentModule);
            const lesson = mod?.lessons.find(l => l.lessonId === currentLesson);
            if (lesson?.exercise?.hints) {
                const lastHint = lesson.exercise.hints[lesson.exercise.hints.length - 1];
                Editor.setValue(lastHint);
            }
        });

        // Start/continue learning
        document.getElementById('start-learning-btn').addEventListener('click', () => {
            Gamification.playSound('click');
            navigateTo(1, 1);
        });

        document.getElementById('continue-learning-btn').addEventListener('click', () => {
            Gamification.playSound('click');
            const data = Progress.load();
            if (data.currentModule && data.currentLesson) {
                navigateTo(data.currentModule, data.currentLesson);
            } else {
                navigateTo(1, 1);
            }
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
            setTimeout(() => Editor.refresh(), 350);
        });

        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Schema explorer
        document.getElementById('schema-btn').addEventListener('click', UI.renderSchemaModal);

        // Achievements
        document.getElementById('achievements-btn').addEventListener('click', UI.renderAchievementsModal);

        // Stats
        document.getElementById('stats-btn').addEventListener('click', UI.renderStatsModal);

        // Daily challenge
        document.getElementById('daily-challenge-btn').addEventListener('click', UI.renderDailyChallengeModal);

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', UI.closeModals);
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) UI.closeModals();
            });
        });

        // Hash change
        window.addEventListener('hashchange', () => {
            const hash = parseHash();
            if (hash && (hash.moduleId !== currentModule || hash.lessonId !== currentLesson)) {
                navigateTo(hash.moduleId, hash.lessonId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') UI.closeModals();
        });
    }

    function handleRunQuery() {
        const sql = Editor.getValue();
        if (!sql) {
            UI.showToast('Please enter a SQL query.', 'error', '&#9888;');
            return;
        }

        const result = Database.runQuery(sql);
        Progress.recordQuery();
        UI.renderResults(result);

        // Award XP for running a query
        const queryXP = Gamification.awardXP(Gamification.XP_REWARDS.queryRun, 'Query');

        // Track daily progress for queries
        Gamification.updateDailyProgress('queries', 1);

        // Check daily first query
        const data = Progress.load();
        const today = new Date().toISOString().split('T')[0];
        if (!data.gamification) data.gamification = Gamification.getDefaultGamification();
        if (data.gamification.lastQueryDate !== today) {
            data.gamification.lastQueryDate = today;
            Progress.save(data);
            Gamification.awardXP(Gamification.XP_REWARDS.dailyFirst, 'First Query Today');
        }

        // Check if this is an exercise
        const mod = CURRICULUM.find(m => m.moduleId === currentModule);
        const lesson = mod?.lessons.find(l => l.lessonId === currentLesson);

        if (lesson?.exercise) {
            const validation = Exercises.validateResult(result, lesson.exercise);
            const hintsUsed = Exercises.getHintsRevealed();
            const totalHints = lesson.exercise.hints?.length || 0;
            const score = Exercises.calculateScore(hintsUsed, totalHints);

            const lessonKey = `${currentModule}-${currentLesson}`;

            if (validation.passed) {
                // Track attempts
                const isFirstAttempt = !exerciseAttempts[lessonKey];
                exerciseAttempts[lessonKey] = (exerciseAttempts[lessonKey] || 0) + 1;

                // Combo system
                const combo = Gamification.addCombo();
                UI.showComboIndicator(combo);
                Gamification.playSound('combo');

                if (combo >= 3) {
                    const runBtn = document.getElementById('run-btn');
                    runBtn.getBoundingClientRect(); // force layout
                    const rect = runBtn.getBoundingClientRect();
                    Gamification.spawnComboParticles(rect.left + rect.width / 2, rect.top);
                }

                if (combo >= 5) {
                    Gamification.screenShake(2 + Math.min(combo, 20));
                }

                // Calculate and award exercise XP
                const elapsedSeconds = Exercises.getElapsedSeconds();
                const xpRewards = Gamification.calculateExerciseXP(
                    true, score, hintsUsed, elapsedSeconds, isFirstAttempt
                );

                const xpResults = xpRewards.map(r => Gamification.awardXP(r.amount, r.reason));

                // Combo bonus XP
                if (combo >= 2) {
                    const comboXP = Gamification.awardXP(
                        Gamification.XP_REWARDS.comboBonus * combo,
                        `${combo}x Combo`
                    );
                    xpResults.push(comboXP);
                }

                // Show XP popup and feedback
                UI.showXPPopup(xpResults);
                UI.renderExerciseFeedbackWithXP(true, validation.message, score, xpResults);

                // Particle effects
                const fb = document.getElementById('exercise-feedback');
                if (fb) {
                    const rect = fb.getBoundingClientRect();
                    Gamification.spawnXPParticles(rect.left + rect.width / 2, rect.top);
                }

                if (score === 100) {
                    const rect = document.getElementById('exercise-feedback').getBoundingClientRect();
                    Gamification.spawnConfetti(rect.left + rect.width / 2, rect.top);
                }

                Gamification.playSound('xp');

                // Check speed achievement
                if (elapsedSeconds < 30) {
                    const d = Progress.load();
                    if (!d.achievements.includes('speed_demon')) {
                        d.achievements.push('speed_demon');
                        Progress.save(d);
                    }
                    Gamification.updateDailyProgress('speed', 1);
                }

                // Save progress
                Progress.saveLessonProgress(currentModule, currentLesson, { score, hintsUsed });

                if (score === 100) {
                    Progress.recordPerfectScore();
                    Gamification.updateDailyProgress('perfects', 1);
                }

                if (hintsUsed === 0) {
                    Gamification.updateDailyProgress('no_hints', 1);
                }

                // Daily exercise progress
                Gamification.updateDailyProgress('exercises', 1);

                // Check if daily challenge just completed
                const challenge = Gamification.getDailyChallenge();
                const dailyResult = Gamification.getDailyChallengeProgress();
                if (dailyResult.completed) {
                    const d2 = Progress.load();
                    if (!d2.gamification) d2.gamification = Gamification.getDefaultGamification();
                    // Only award once
                    const dp = d2.gamification.dailyProgress;
                    if (dp && !dp.xpAwarded) {
                        dp.xpAwarded = true;
                        d2.gamification.dailyChallengesCompleted = (d2.gamification.dailyChallengesCompleted || 0) + 1;
                        Progress.save(d2);
                        const dailyXP = Gamification.awardXP(challenge.xp, 'Daily Challenge');
                        UI.showToast(`Daily Challenge Complete! +${dailyXP.xpGained} XP`, 'achievement', '&#9876;');
                    }
                }

                // Check for module completion bonus
                const wasModuleComplete = Progress.isModuleComplete(currentModule);
                // Re-check after saving
                setTimeout(() => {
                    if (!wasModuleComplete && Progress.isModuleComplete(currentModule)) {
                        const modXP = Gamification.awardXP(Gamification.XP_REWARDS.moduleComplete, 'Module Complete');
                        UI.showToast(`Module ${currentModule} Complete! +${modXP.xpGained} XP`, 'achievement', '&#127942;');
                        const cx = window.innerWidth / 2;
                        const cy = window.innerHeight / 2;
                        Gamification.spawnConfetti(cx, cy);
                    }
                }, 100);

                // Check for level up
                const lastResult = xpResults[xpResults.length - 1];
                if (lastResult && lastResult.leveledUp) {
                    setTimeout(() => {
                        UI.showLevelUpOverlay(lastResult.newLevel, lastResult.title);
                    }, 500);
                } else {
                    // Check if any result triggered level up
                    for (const r of xpResults) {
                        if (r.leveledUp) {
                            setTimeout(() => {
                                UI.showLevelUpOverlay(r.newLevel, r.title);
                            }, 500);
                            break;
                        }
                    }
                }

                // Check achievements
                const newAchievements = Gamification.checkEnhancedAchievements();
                newAchievements.forEach((a, i) => {
                    setTimeout(() => UI.showAchievementToast(a), 800 + i * 600);
                });

                UI.renderSidebar();
                UI.updateXPBar();

                // Run button glow on combo
                const runBtn = document.getElementById('run-btn');
                if (combo >= 3) {
                    runBtn.classList.add('combo-glow');
                }

            } else {
                // Failed attempt
                exerciseAttempts[lessonKey] = (exerciseAttempts[lessonKey] || 0) + 1;

                UI.renderExerciseFeedback(validation.passed, validation.message, score);

                // Break combo on wrong answer
                const wasBroken = Gamification.breakCombo();
                if (wasBroken >= 3) {
                    UI.showToast(`${wasBroken}x combo broken!`, 'error', '&#128148;');
                    Gamification.screenShake(3);
                }
                UI.hideComboIndicator();
                Gamification.playSound('fail');

                // Remove combo glow
                document.getElementById('run-btn').classList.remove('combo-glow');
            }
        } else {
            // Not an exercise, just a free query — still check achievements
            const newAchievements = Gamification.checkEnhancedAchievements();
            newAchievements.forEach((a, i) => {
                setTimeout(() => UI.showAchievementToast(a), i * 600);
            });
        }

        // Update daily combo progress
        Gamification.updateDailyProgress('combo', 0); // Just triggers re-check
        const currentCombo = Gamification.getCombo();
        if (currentCombo > 0) {
            const d = Progress.load();
            if (!d.gamification) d.gamification = Gamification.getDefaultGamification();
            const dp = d.gamification.dailyProgress;
            if (dp && (dp.combo || 0) < currentCombo) {
                dp.combo = currentCombo;
                Progress.save(d);
            }
        }

        UI.updateXPBar();
    }

    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        Editor.setTheme(newTheme === 'dark');
        Progress.saveTheme(newTheme);

        const btn = document.getElementById('theme-toggle');
        btn.innerHTML = newTheme === 'dark' ? '&#9790;' : '&#9788;';
    }

    function loadTheme() {
        const data = Progress.load();
        const theme = data.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        Editor.setTheme(theme === 'dark');
        const btn = document.getElementById('theme-toggle');
        btn.innerHTML = theme === 'dark' ? '&#9790;' : '&#9788;';
    }

    // Public API
    const api = {
        init, navigateTo,
        get currentModule() { return currentModule; },
        get currentLesson() { return currentLesson; }
    };

    return api;
})();

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
