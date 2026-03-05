// ui.js — DOM rendering: sidebar, lessons, results, modals, toasts

const UI = (() => {
    function renderSidebar() {
        const nav = document.getElementById('module-nav');
        nav.innerHTML = '';

        CURRICULUM.forEach(mod => {
            const modProgress = Progress.getModuleProgress(mod.moduleId);
            const isActive = App?.currentModule === mod.moduleId;
            const isExpanded = isActive;

            const levelClass = `level-${mod.level}`;
            const levelLabel = mod.level.charAt(0).toUpperCase() + mod.level.slice(1);

            const div = document.createElement('div');
            div.className = 'nav-module';
            div.innerHTML = `
                <div class="nav-module-header ${isExpanded ? 'expanded' : ''} ${isActive ? 'active' : ''}" data-module="${mod.moduleId}">
                    <span class="nav-module-arrow">&#9654;</span>
                    <span class="nav-module-title">${mod.moduleId}. ${mod.title}</span>
                    <span class="nav-module-progress">${modProgress.completed}/${modProgress.total}</span>
                    <span class="nav-module-level ${levelClass}">${levelLabel}</span>
                </div>
                <div class="nav-lessons">
                    ${mod.lessons.map(lesson => {
                        const lp = Progress.getLessonProgress(mod.moduleId, lesson.lessonId);
                        const isLessonActive = App?.currentModule === mod.moduleId && App?.currentLesson === lesson.lessonId;
                        const completedClass = lp && lp.completed ? 'completed' : '';
                        const activeClass = isLessonActive ? 'active' : '';
                        const checkIcon = lp && lp.completed ? '&#10003;' : (lesson.exercise ? '&#9675;' : '&#8212;');
                        return `
                            <div class="nav-lesson ${completedClass} ${activeClass}" data-module="${mod.moduleId}" data-lesson="${lesson.lessonId}">
                                <span class="lesson-check">${checkIcon}</span>
                                <span class="lesson-title">${lesson.title}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            nav.appendChild(div);
        });

        // Event listeners
        nav.querySelectorAll('.nav-module-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
            });
        });

        nav.querySelectorAll('.nav-lesson').forEach(lesson => {
            lesson.addEventListener('click', () => {
                const moduleId = parseInt(lesson.dataset.module);
                const lessonId = parseInt(lesson.dataset.lesson);
                App.navigateTo(moduleId, lessonId);
            });
        });
    }

    function renderLesson(moduleId, lessonId) {
        const mod = CURRICULUM.find(m => m.moduleId === moduleId);
        if (!mod) return;
        const lesson = mod.lessons.find(l => l.lessonId === lessonId);
        if (!lesson) return;

        // Show lesson view, hide welcome
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('lesson-view').style.display = 'flex';

        // Breadcrumb
        document.getElementById('lesson-breadcrumb').textContent =
            `Module ${mod.moduleId}: ${mod.title} > ${lesson.title}`;

        // Content
        const contentEl = document.getElementById('lesson-content');
        let html = marked.parse(lesson.content);

        // Add example query buttons
        if (lesson.exampleQueries && lesson.exampleQueries.length > 0) {
            html += '<div style="margin-top: 12px;"><strong>Try it:</strong></div>';
            html += lesson.exampleQueries.map((eq, i) =>
                `<button class="example-query" data-index="${i}">&#9654; ${eq.label}</button>`
            ).join('');
        }

        // Add exercise prompt
        if (lesson.exercise) {
            html += `<div class="exercise-prompt">
                <h3>&#127919; Exercise</h3>
                <p>${lesson.exercise.prompt}</p>
            </div>`;
        }

        contentEl.innerHTML = html;

        // Example query click handlers
        contentEl.querySelectorAll('.example-query').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                Editor.setValue(lesson.exampleQueries[idx].sql);
            });
        });

        // Setup editor for exercise
        if (lesson.exercise) {
            if (lesson.exercise.startingCode) {
                Editor.setValue(lesson.exercise.startingCode);
            }
            Exercises.startExercise();
            document.getElementById('hint-btn').style.display = 'inline-flex';
            document.getElementById('solution-btn').style.display = 'inline-flex';
        } else {
            document.getElementById('hint-btn').style.display = 'none';
            document.getElementById('solution-btn').style.display = 'none';
        }

        // Clear results
        document.getElementById('results-content').innerHTML =
            '<p class="placeholder-text">Run a query to see results here.</p>';
        document.getElementById('exercise-feedback').style.display = 'none';
        document.getElementById('query-time').textContent = '';

        // Nav buttons
        updateNavButtons(moduleId, lessonId);

        // Scroll lesson content to top
        document.getElementById('lesson-panel').scrollTop = 0;

        Editor.refresh();
    }

    function updateNavButtons(moduleId, lessonId) {
        const prev = getPrevLesson(moduleId, lessonId);
        const next = getNextLesson(moduleId, lessonId);

        const prevBtn = document.getElementById('prev-lesson-btn');
        const nextBtn = document.getElementById('next-lesson-btn');

        prevBtn.style.display = prev ? 'inline-flex' : 'none';
        nextBtn.style.display = next ? 'inline-flex' : 'none';

        prevBtn.onclick = prev ? () => App.navigateTo(prev.moduleId, prev.lessonId) : null;
        nextBtn.onclick = next ? () => App.navigateTo(next.moduleId, next.lessonId) : null;
    }

    function getPrevLesson(moduleId, lessonId) {
        const modIdx = CURRICULUM.findIndex(m => m.moduleId === moduleId);
        const mod = CURRICULUM[modIdx];
        const lessonIdx = mod.lessons.findIndex(l => l.lessonId === lessonId);

        if (lessonIdx > 0) {
            return { moduleId, lessonId: mod.lessons[lessonIdx - 1].lessonId };
        }
        if (modIdx > 0) {
            const prevMod = CURRICULUM[modIdx - 1];
            return { moduleId: prevMod.moduleId, lessonId: prevMod.lessons[prevMod.lessons.length - 1].lessonId };
        }
        return null;
    }

    function getNextLesson(moduleId, lessonId) {
        const modIdx = CURRICULUM.findIndex(m => m.moduleId === moduleId);
        const mod = CURRICULUM[modIdx];
        const lessonIdx = mod.lessons.findIndex(l => l.lessonId === lessonId);

        if (lessonIdx < mod.lessons.length - 1) {
            return { moduleId, lessonId: mod.lessons[lessonIdx + 1].lessonId };
        }
        if (modIdx < CURRICULUM.length - 1) {
            const nextMod = CURRICULUM[modIdx + 1];
            return { moduleId: nextMod.moduleId, lessonId: nextMod.lessons[0].lessonId };
        }
        return null;
    }

    function renderResults(result) {
        const contentEl = document.getElementById('results-content');
        const timeEl = document.getElementById('query-time');

        timeEl.textContent = result.time ? `${result.time}ms` : '';

        if (result.error) {
            let html = `<div class="error-message">${escapeHtml(result.error)}`;
            const friendly = Exercises.getFriendlyError(result.error);
            if (friendly) {
                html += `<div class="error-hint">${escapeHtml(friendly)}</div>`;
            }
            html += '</div>';
            contentEl.innerHTML = html;
            return;
        }

        if (!result.columns || result.columns.length === 0) {
            contentEl.innerHTML = '<p class="placeholder-text">Query executed successfully. No results to display.</p>';
            return;
        }

        const maxRows = 200;
        const displayValues = result.values.slice(0, maxRows);

        let html = '<table class="results-table"><thead><tr>';
        result.columns.forEach(col => {
            html += `<th>${escapeHtml(col)}</th>`;
        });
        html += '</tr></thead><tbody>';

        displayValues.forEach(row => {
            html += '<tr>';
            row.forEach(val => {
                const display = val === null ? '<em>NULL</em>' : escapeHtml(String(val));
                html += `<td>${display}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';

        if (result.values.length > maxRows) {
            html += `<p class="results-info">Showing ${maxRows} of ${result.values.length} rows.</p>`;
        } else {
            html += `<p class="results-info">${result.values.length} row(s) returned.</p>`;
        }

        contentEl.innerHTML = html;
    }

    function renderExerciseFeedback(passed, message, score) {
        const feedbackEl = document.getElementById('exercise-feedback');
        feedbackEl.style.display = 'block';

        if (passed) {
            feedbackEl.innerHTML = `
                <div class="feedback-success">
                    &#10003; ${escapeHtml(message)}
                    <div class="feedback-score">Score: ${score}/100</div>
                </div>`;
        } else {
            feedbackEl.innerHTML = `
                <div class="feedback-fail">
                    &#10007; ${escapeHtml(message)}
                </div>`;
        }
    }

    function renderHint(hints, revealedCount) {
        const feedbackEl = document.getElementById('exercise-feedback');
        feedbackEl.style.display = 'block';

        let html = '';
        for (let i = 0; i < revealedCount; i++) {
            html += `<div class="hint-box">
                <div class="hint-label">Hint ${i + 1} of ${hints.length}</div>
                ${marked.parse(hints[i])}
            </div>`;
        }

        if (revealedCount >= hints.length) {
            html += '<p class="text-muted" style="margin-top: 8px; font-size: 13px;">No more hints available.</p>';
        }

        feedbackEl.innerHTML = html;
    }

    function renderSchemaModal() {
        const schema = Database.getSchema();
        const body = document.getElementById('schema-body');

        body.innerHTML = schema.map(table => `
            <div class="schema-table">
                <div class="schema-table-name">${table.name}</div>
                <div class="schema-columns">
                    ${table.columns.map(col => `
                        <span class="schema-col-name ${col.pk ? 'pk' : ''}">${col.pk ? '🔑 ' : ''}${col.name}</span>
                        <span class="schema-col-type">${col.type || 'ANY'}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.getElementById('schema-modal').style.display = 'flex';
    }

    function renderAchievementsModal() {
        const achievements = Gamification.getEnhancedAchievements();
        const body = document.getElementById('achievements-body');

        // Group by rarity
        const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
        const sorted = [...achievements].sort((a, b) => {
            const ai = rarityOrder.indexOf(a.rarity);
            const bi = rarityOrder.indexOf(b.rarity);
            if (ai !== bi) return ai - bi;
            return (a.unlocked ? 0 : 1) - (b.unlocked ? 0 : 1);
        });

        body.innerHTML = sorted.map(a => `
            <div class="achievement-card ${a.unlocked ? 'unlocked' : ''} rarity-${a.rarity}">
                <span class="achievement-icon">${a.icon}</span>
                <span class="achievement-name">${a.name}</span>
                <span class="achievement-desc">${a.desc}</span>
                <span class="achievement-rarity">${a.rarity}</span>
                <span class="achievement-xp">+${a.xp || 0} XP</span>
            </div>
        `).join('');

        document.getElementById('achievements-modal').style.display = 'flex';
    }

    function updateProgressBar() {
        // Now updates the XP bar instead of old progress bar
        updateXPBar();
    }

    function updateXPBar() {
        const stats = Gamification.getStats();
        const levelEl = document.getElementById('level-number');
        const barFill = document.getElementById('xp-bar-fill');
        const barText = document.getElementById('xp-bar-text');
        const streakCount = document.getElementById('streak-count');
        const streakBadge = document.getElementById('streak-badge');

        if (levelEl) levelEl.textContent = stats.level;
        if (barFill) {
            const pct = stats.xpLevelRange > 0 ? Math.min(100, (stats.xpInLevel / stats.xpLevelRange) * 100) : 0;
            barFill.style.width = `${pct}%`;
        }
        if (barText) {
            barText.textContent = `${stats.xpInLevel} / ${stats.xpLevelRange} XP  (Lvl ${stats.level} ${stats.title.title})`;
        }
        if (streakCount) streakCount.textContent = stats.streakDays;
        if (streakBadge) {
            streakBadge.classList.toggle('active', stats.streakDays > 0);
        }
    }

    function showXPPopup(rewards) {
        const popup = document.getElementById('xp-popup');
        const content = document.getElementById('xp-popup-content');
        if (!popup || !content) return;

        content.innerHTML = '';
        popup.classList.remove('hidden');

        rewards.forEach((r, i) => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'xp-gain-line';
                const mult = Gamification.getComboMultiplier();
                line.textContent = mult > 1
                    ? `+${r.xpGained} XP ${r.reason} (${mult}x)`
                    : `+${r.xpGained} XP ${r.reason}`;
                content.appendChild(line);
            }, i * 200);
        });

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 2000 + rewards.length * 200);
    }

    function showComboIndicator(combo) {
        const el = document.getElementById('combo-indicator');
        if (!el) return;

        if (combo < 2) {
            el.classList.add('hidden');
            return;
        }

        el.classList.remove('hidden');
        document.getElementById('combo-count').textContent = combo;
        document.getElementById('combo-multiplier').textContent = `x${Gamification.getComboMultiplier()}`;

        el.classList.remove('hot', 'fire');
        if (combo >= 10) el.classList.add('fire');
        else if (combo >= 5) el.classList.add('hot');

        // Re-trigger animation
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
    }

    function hideComboIndicator() {
        const el = document.getElementById('combo-indicator');
        if (el) el.classList.add('hidden');
    }

    function showLevelUpOverlay(level, title) {
        const overlay = document.getElementById('levelup-overlay');
        if (!overlay) return;

        document.getElementById('levelup-level').textContent = `Level ${level}`;
        document.getElementById('levelup-title').textContent = title.title;
        document.getElementById('levelup-title').style.color = title.color;

        overlay.classList.remove('hidden');

        // Confetti from center
        setTimeout(() => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            Gamification.spawnConfetti(cx, cy);
            Gamification.playSound('levelup');
        }, 300);

        // Auto-dismiss
        overlay.onclick = () => overlay.classList.add('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 3500);
    }

    function renderStatsModal() {
        const stats = Gamification.getStats();
        const body = document.getElementById('stats-body');

        const overallProgress = Progress.getOverallProgress();

        body.innerHTML = `
            <div class="stats-header">
                <div style="font-size: 48px; font-weight: 900; color: ${stats.title.color};">
                    Level ${stats.level}
                </div>
                <div class="stats-title-badge" style="color: ${stats.title.color}; border-color: ${stats.title.color};">
                    ${stats.title.title}
                </div>
                <div style="margin-top: 12px; font-size: 14px; color: var(--text-muted);">
                    Total XP: <strong style="color: var(--warning);">${stats.totalXP.toLocaleString()}</strong>
                    &bull; Next Level: <strong>${stats.xpToNext.toLocaleString()} XP</strong>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.totalQueriesRun}</div>
                    <div class="stat-tile-label">Queries Run</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.exercisesCompleted}</div>
                    <div class="stat-tile-label">Exercises Done</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.perfectScores}</div>
                    <div class="stat-tile-label">Perfect Scores</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${overallProgress}%</div>
                    <div class="stat-tile-label">Curriculum</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value" style="color: var(--warning);">${stats.streakDays}</div>
                    <div class="stat-tile-label">Day Streak</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.longestStreak}</div>
                    <div class="stat-tile-label">Best Streak</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value" style="color: var(--error);">${stats.maxCombo}</div>
                    <div class="stat-tile-label">Max Combo</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.achievementsUnlocked}/${stats.achievementsTotal}</div>
                    <div class="stat-tile-label">Achievements</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.totalDaysActive}</div>
                    <div class="stat-tile-label">Days Active</div>
                </div>
                <div class="stat-tile">
                    <div class="stat-tile-value">${stats.dailyChallengesCompleted}</div>
                    <div class="stat-tile-label">Dailies Done</div>
                </div>
            </div>
        `;

        document.getElementById('stats-modal').style.display = 'flex';
    }

    function renderDailyChallengeModal() {
        const challenge = Gamification.getDailyChallenge();
        const progress = Gamification.getDailyChallengeProgress();
        const body = document.getElementById('daily-body');

        const pct = Math.min(100, Math.round((progress.current / challenge.target) * 100));

        body.innerHTML = `
            <div class="daily-challenge-card">
                <div class="daily-challenge-title">${challenge.title}</div>
                <div class="daily-challenge-desc">${challenge.desc}</div>
                <div class="daily-progress-bar">
                    <div class="daily-progress-fill" style="width: ${pct}%"></div>
                    <div class="daily-progress-text">${progress.current} / ${challenge.target}</div>
                </div>
                ${progress.completed
                    ? '<div class="daily-completed">&#10003; Challenge Complete!</div>'
                    : `<div class="daily-xp-reward">Reward: +${challenge.xp} XP</div>`}
            </div>
        `;

        document.getElementById('daily-modal').style.display = 'flex';
    }

    function renderExerciseFeedbackWithXP(passed, message, score, xpRewards) {
        const feedbackEl = document.getElementById('exercise-feedback');
        feedbackEl.style.display = 'block';

        if (passed) {
            let xpHtml = '';
            if (xpRewards && xpRewards.length > 0) {
                xpHtml = '<div class="feedback-xp-breakdown">';
                xpRewards.forEach(r => {
                    xpHtml += `<div class="feedback-xp-line">
                        <span>${r.reason}</span>
                        <span>+${r.xpGained} XP</span>
                    </div>`;
                });
                const totalXP = xpRewards.reduce((sum, r) => sum + r.xpGained, 0);
                xpHtml += `<div class="feedback-xp-line" style="border-top: 1px solid var(--warning); margin-top: 4px; padding-top: 4px; font-weight: 800;">
                    <span>Total</span>
                    <span>+${totalXP} XP</span>
                </div>`;
                xpHtml += '</div>';
            }

            feedbackEl.innerHTML = `
                <div class="feedback-success">
                    &#10003; ${escapeHtml(message)}
                    <div class="feedback-score">Score: ${score}/100</div>
                    ${xpHtml}
                </div>`;
        } else {
            feedbackEl.innerHTML = `
                <div class="feedback-fail">
                    &#10007; ${escapeHtml(message)}
                </div>`;
        }
    }

    function showToast(message, type = 'success', icon = '') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `${icon ? `<span class="toast-icon">${icon}</span>` : ''}<span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function showAchievementToast(achievement) {
        showToast(`${achievement.name} — ${achievement.desc}`, 'achievement', achievement.icon);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderCommandExplorer(filterText) {
        const body = document.getElementById('command-body');
        const tabsEl = document.getElementById('command-category-tabs');
        const searchEl = document.getElementById('command-search');
        const filter = (filterText || '').toLowerCase().trim();

        // Build category tabs (only on first render or when no filter)
        if (!tabsEl.dataset.built) {
            tabsEl.innerHTML = '<button class="cmd-tab active" data-cat="all">All</button>' +
                SQL_REFERENCE.map(cat =>
                    `<button class="cmd-tab" data-cat="${cat.category}">${cat.category}</button>`
                ).join('');
            tabsEl.dataset.built = '1';

            tabsEl.addEventListener('click', (e) => {
                const tab = e.target.closest('.cmd-tab');
                if (!tab) return;
                tabsEl.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabsEl.dataset.activeCat = tab.dataset.cat;
                searchEl.value = '';
                renderCommandExplorer('');
            });

            searchEl.addEventListener('input', () => {
                // Reset category to "All" when searching
                tabsEl.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
                tabsEl.querySelector('[data-cat="all"]').classList.add('active');
                tabsEl.dataset.activeCat = 'all';
                renderCommandExplorer(searchEl.value);
            });
        }

        const activeCat = tabsEl.dataset.activeCat || 'all';

        let html = '';
        SQL_REFERENCE.forEach(cat => {
            if (activeCat !== 'all' && cat.category !== activeCat) return;

            const cmds = cat.commands.filter(cmd => {
                if (!filter) return true;
                return cmd.name.toLowerCase().includes(filter) ||
                       cmd.description.toLowerCase().includes(filter) ||
                       cmd.syntax.toLowerCase().includes(filter);
            });

            if (cmds.length === 0) return;

            html += `<div class="cmd-category-section">
                <div class="cmd-category-title">${cat.category}</div>`;

            cmds.forEach(cmd => {
                html += `<div class="cmd-card" data-example="${escapeHtml(cmd.example)}">
                    <div class="cmd-card-header">
                        <span class="cmd-name">${escapeHtml(cmd.name)}</span>
                        <span class="cmd-module-tag">Module ${cmd.module}</span>
                    </div>
                    <div class="cmd-syntax"><code>${escapeHtml(cmd.syntax)}</code></div>
                    <div class="cmd-desc">${escapeHtml(cmd.description)}</div>
                    <div class="cmd-example-area">
                        <button class="cmd-try-btn" title="Load into editor">Try it</button>
                        <code class="cmd-example-code">${escapeHtml(cmd.example)}</code>
                    </div>
                </div>`;
            });

            html += '</div>';
        });

        if (!html) {
            html = '<div class="cmd-no-results">No commands found matching your search.</div>';
        }

        body.innerHTML = html;

        // "Try it" buttons — load example into editor
        body.querySelectorAll('.cmd-try-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.cmd-card');
                const example = card.dataset.example;
                Editor.setValue(example);
                closeModals();
            });
        });

        document.getElementById('command-modal').style.display = 'flex';
    }

    function closeModals() {
        document.getElementById('schema-modal').style.display = 'none';
        document.getElementById('achievements-modal').style.display = 'none';
        document.getElementById('stats-modal').style.display = 'none';
        document.getElementById('daily-modal').style.display = 'none';
        document.getElementById('command-modal').style.display = 'none';
    }

    function showAchievementToastEnhanced(achievement) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast achievement rarity-${achievement.rarity || 'common'}`;
        toast.innerHTML = `
            <span class="toast-icon">${achievement.icon}</span>
            <div>
                <div><strong>${achievement.name}</strong> — ${achievement.desc}</div>
                <div class="toast-rarity">${achievement.rarity || 'common'} &bull; +${achievement.xp || 0} XP</div>
            </div>`;
        container.appendChild(toast);

        Gamification.playSound('achievement');

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    return {
        renderSidebar, renderLesson, renderResults,
        renderExerciseFeedback, renderExerciseFeedbackWithXP,
        renderHint, renderSchemaModal,
        renderAchievementsModal, renderCommandExplorer,
        updateProgressBar, updateXPBar,
        showToast, showAchievementToast: showAchievementToastEnhanced,
        showXPPopup, showComboIndicator, hideComboIndicator,
        showLevelUpOverlay, renderStatsModal, renderDailyChallengeModal,
        closeModals, getNextLesson
    };
})();
