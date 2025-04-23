import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const WutheringWavesEchoCalculator = () => {
    // Theme colors
    const colors = {
        background: "#0D1117",
        cardBg: "#161B22",
        primary: "#58A6FF",
        primaryDark: "#1F6FEB",
        accent: "#7EE7B8",
        accentDark: "#26A69A",
        text: "#C9D1D9",
        textDark: "#8B949E",
        limited: "#FF79C6",
        standard: "#8BE9FD",
        success: "#86EFAC",
        successDark: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        progress: "#10B981",
        inputBg: "#1E293B",
        inputBorder: "#3B82F6",
        scrollbarBg: "#1F2937",
        scrollbarThumb: "#4B5563",
        buttonBg: "#3B82F6",
        buttonHover: "#2563EB",
        buttonText: "#FFFFFF"
    };

    // Echo costs
    const echoCosts = [1, 3, 4];

    // Main stats by cost
    const mainStatsByCost = {
        1: ["HP", "HP%", "ATK%", "DEF%"],
        3: ["ATK", "HP%", "ATK%", "DEF%", "Aero DMG", "Glacio DMG", "Fusion DMG", "Electro DMG", "Havoc DMG", "Spectro DMG", "Energy Regen"],
        4: ["ATK", "HP%", "ATK%", "DEF%", "CRIT Rate", "CRIT DMG", "Healing Bonus"]
    };

    // All possible substats
    const allSubstats = [
        "HP", "ATK", "DEF", "HP%", "ATK%", "DEF%", "CRIT Rate", "CRIT DMG",
        "Energy Regen", "Basic Attack DMG Bonus", "Heavy Attack DMG Bonus",
        "Resonance Skill DMG Bonus", "Resonance Liberation DMG Bonus"
    ];

    // Substat ranges with discrete values
    const substatRanges = {
        "HP": { values: [320, 407, 493, 580], min: 320, max: 580, isFlat: true },
        "ATK": { values: [30, 40, 50, 60], min: 30, max: 60, isFlat: true },
        "DEF": { values: [40, 50, 60, 70], min: 40, max: 70, isFlat: true },
        "HP%": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false },
        "ATK%": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false },
        "DEF%": { values: [8.1, 9.0, 10.0, 10.9, 11.8, 12.8, 13.8, 14.7], min: 8.1, max: 14.7, isFlat: false },
        "CRIT Rate": { values: [6.3, 6.9, 7.5, 8.1, 8.7, 9.3, 9.9, 10.5], min: 6.3, max: 10.5, isFlat: false },
        "CRIT DMG": { values: [12.6, 13.8, 15.0, 16.2, 17.4, 18.6, 19.8, 21.0], min: 12.6, max: 21.0, isFlat: false },
        "Energy Regen": { values: [6.8, 7.6, 8.4, 9.2, 10.0, 10.8, 11.6, 12.4], min: 6.8, max: 12.4, isFlat: false },
        "Basic Attack DMG Bonus": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false },
        "Heavy Attack DMG Bonus": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false },
        "Resonance Skill DMG Bonus": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false },
        "Resonance Liberation DMG Bonus": { values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], min: 6.4, max: 11.6, isFlat: false }
    };

    // Probability distributions for substat values
    const percentStatProbabilities = [7.39, 6.90, 20.72, 24.90, 18.23, 13.60, 5.34, 2.93]; // For percentage-based stats
    const flatStatProbabilities = [12.43, 46.21, 38.57, 2.79]; // For flat stats (HP, ATK, DEF)

    // State for tabs
    const [activeTab, setActiveTab] = useState('echoCalculator');

    // State for Echo Calculator tab (Tab 1)
    const [echoCost, setEchoCost] = useState(1);
    const [mainStat, setMainStat] = useState("");
    const [selectedSubstats, setSelectedSubstats] = useState([]);
    const [substatValues, setSubstatValues] = useState({});
    const [results, setResults] = useState(null);
    const [mainStatProb, setMainStatProb] = useState(0);
    const [substatProb, setSubstatProb] = useState(0);
    const [valueProb, setValueProb] = useState(0);
    const [totalProb, setTotalProb] = useState(0);
    const [waveplateInfo, setWaveplateInfo] = useState(null);
    const [confidenceLevel, setConfidenceLevel] = useState(80);

    // State for Substat Roll Calculator tab (Tab 2)
    const [rollEchoCost, setRollEchoCost] = useState(1);
    const [rollMainStat, setRollMainStat] = useState("");
    const [existingSubstats, setExistingSubstats] = useState([]);
    const [existingSubstatValues, setExistingSubstatValues] = useState({});
    const [desiredSubstats, setDesiredSubstats] = useState([]);
    const [desiredSubstatValues, setDesiredSubstatValues] = useState({});
    const [rollResults, setRollResults] = useState(null);
    const [rollMainStatProb, setRollMainStatProb] = useState(0);
    const [rollSubstatProb, setRollSubstatProb] = useState(0);
    const [rollValueProb, setRollValueProb] = useState(0);
    const [rollTotalProb, setRollTotalProb] = useState(0);
    const [rollWaveplateInfo, setRollWaveplateInfo] = useState(null);
    const [rollConfidenceLevel, setRollConfidenceLevel] = useState(80);

    // Initialize main stat when cost changes (Tab 1)
    useEffect(() => {
        if (mainStatsByCost[echoCost]) {
            setMainStat(mainStatsByCost[echoCost][0]);
            setSelectedSubstats([]);
            setSubstatValues({});
            setResults(null);
            setWaveplateInfo(null);
        }
    }, [echoCost]);

    // Initialize main stat when cost changes (Tab 2)
    useEffect(() => {
        if (mainStatsByCost[rollEchoCost]) {
            setRollMainStat(mainStatsByCost[rollEchoCost][0]);
            setExistingSubstats([]);
            setExistingSubstatValues({});
            setDesiredSubstats([]);
            setDesiredSubstatValues({});
            setRollResults(null);
            setRollWaveplateInfo(null);
        }
    }, [rollEchoCost]);

    // Toggle a substat selection (Tab 1)
    const toggleSubstat = (stat) => {
        if (selectedSubstats.includes(stat)) {
            setSelectedSubstats(selectedSubstats.filter(s => s !== stat));
            const newValues = { ...substatValues };
            delete newValues[stat];
            setSubstatValues(newValues);
        } else if (selectedSubstats.length < 5) {
            setSelectedSubstats([...selectedSubstats, stat]);
            setSubstatValues(prev => ({
                ...prev,
                [stat]: substatRanges[stat].min
            }));
        }
    };

    // Toggle an existing substat (Tab 2)
    const toggleExistingSubstat = (stat) => {
        if (existingSubstats.includes(stat)) {
            setExistingSubstats(existingSubstats.filter(s => s !== stat));
            const newValues = { ...existingSubstatValues };
            delete newValues[stat];
            setExistingSubstatValues(newValues);
        } else if (existingSubstats.length < 5) {
            setExistingSubstats([...existingSubstats, stat]);
            setExistingSubstatValues(prev => ({
                ...prev,
                [stat]: substatRanges[stat].min
            }));
            if (desiredSubstats.includes(stat)) {
                setDesiredSubstats(desiredSubstats.filter(s => s !== stat));
                const newDesiredValues = { ...desiredSubstatValues };
                delete newDesiredValues[stat];
                setDesiredSubstatValues(newDesiredValues);
            }
        }
    };

    // Toggle a desired substat (Tab 2)
    const toggleDesiredSubstat = (stat) => {
        const remainingSlots = 5 - existingSubstats.length;
        if (desiredSubstats.includes(stat)) {
            setDesiredSubstats(desiredSubstats.filter(s => s !== stat));
            const newValues = { ...desiredSubstatValues };
            delete newValues[stat];
            setDesiredSubstatValues(newValues);
        } else if (desiredSubstats.length < remainingSlots) {
            setDesiredSubstats([...desiredSubstats, stat]);
            setDesiredSubstatValues(prev => ({
                ...prev,
                [stat]: substatRanges[stat].min
            }));
        }
    };

    // Handle substat value change (Tab 1)
    const handleSubstatValueChange = (stat, value, direction = null) => {
        const validValues = substatRanges[stat].values;
        let currentValue = parseFloat(value);

        if (direction) {
            const currentIndex = validValues.indexOf(substatValues[stat] || validValues[0]);
            let newIndex;

            if (direction === 'up') {
                newIndex = Math.min(currentIndex + 1, validValues.length - 1);
            } else if (direction === 'down') {
                newIndex = Math.max(currentIndex - 1, 0);
            }

            setSubstatValues({
                ...substatValues,
                [stat]: validValues[newIndex]
            });
            return;
        }

        const closestValue = validValues.reduce((prev, curr) =>
            Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev
        );

        setSubstatValues({
            ...substatValues,
            [stat]: closestValue
        });
    };

    // Handle existing substat value change (Tab 2)
    const handleExistingSubstatValueChange = (stat, value, direction = null) => {
        const validValues = substatRanges[stat].values;
        let currentValue = parseFloat(value);

        if (direction) {
            const currentIndex = validValues.indexOf(existingSubstatValues[stat] || validValues[0]);
            let newIndex;

            if (direction === 'up') {
                newIndex = Math.min(currentIndex + 1, validValues.length - 1);
            } else if (direction === 'down') {
                newIndex = Math.max(currentIndex - 1, 0);
            }

            setExistingSubstatValues({
                ...existingSubstatValues,
                [stat]: validValues[newIndex]
            });
            return;
        }

        const closestValue = validValues.reduce((prev, curr) =>
            Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev
        );

        setExistingSubstatValues({
            ...existingSubstatValues,
            [stat]: closestValue
        });
    };

    // Handle desired substat value change (Tab 2)
    const handleDesiredSubstatValueChange = (stat, value, direction = null) => {
        const validValues = substatRanges[stat].values;
        let currentValue = parseFloat(value);

        if (direction) {
            const currentIndex = validValues.indexOf(desiredSubstatValues[stat] || validValues[0]);
            let newIndex;

            if (direction === 'up') {
                newIndex = Math.min(currentIndex + 1, validValues.length - 1);
            } else if (direction === 'down') {
                newIndex = Math.max(currentIndex - 1, 0);
            }

            setDesiredSubstatValues({
                ...desiredSubstatValues,
                [stat]: validValues[newIndex]
            });
            return;
        }

        const closestValue = validValues.reduce((prev, curr) =>
            Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev
        );

        setDesiredSubstatValues({
            ...desiredSubstatValues,
            [stat]: closestValue
        });
    };

    // Calculate the probability of getting a value at or above the threshold
    const calculateValueProbability = (stat, value) => {
        const validValues = substatRanges[stat].values;
        const isFlatStat = substatRanges[stat].isFlat;
        const probabilities = isFlatStat ? flatStatProbabilities : percentStatProbabilities;

        const thresholdIndex = validValues.indexOf(value);
        if (thresholdIndex === -1) return 0;

        let probability = 0;
        for (let i = thresholdIndex; i < probabilities.length; i++) {
            probability += probabilities[i];
        }
        return Math.min(probability, 100);
    };

    // Permutation function
    const permutation = (n, k) => {
        let result = 1;
        for (let i = 0; i < k; i++) {
            result *= (n - i);
        }
        return result;
    };

    // Calculate probabilities (Tab 1)
    const calculateProbability = () => {
        let isMounted = true;

        const cleanup = () => {
            isMounted = false;
        };

        const mainStatCount = mainStatsByCost[echoCost].length;
        const mainStatProbability = Math.min(1 / mainStatCount * 100, 100);

        const totalSubstatOptions = allSubstats.length;
        const desiredCount = selectedSubstats.length;

        let substatProbability = 0;
        if (desiredCount > 0) {
            const totalSequences = permutation(totalSubstatOptions, 5);

            let favorableSequences = 1;
            favorableSequences *= permutation(5, desiredCount);
            const remainingSlots = 5 - desiredCount;
            for (let i = 0; i < remainingSlots; i++) {
                favorableSequences *= (totalSubstatOptions - desiredCount - i);
            }

            substatProbability = Math.min((favorableSequences / totalSequences) * 100, 100);
        } else {
            substatProbability = 100;
        }

        let valuesProbability = 1;
        for (const stat of selectedSubstats) {
            const desiredValue = substatValues[stat];
            const individualProb = calculateValueProbability(stat, desiredValue) / 100;
            valuesProbability *= individualProb;
        }
        valuesProbability = Math.min(valuesProbability * 100, 100);

        const totalProbability = Math.min(
            (mainStatProbability / 100) *
            (substatProbability / 100) *
            (valuesProbability / 100) * 100,
            100
        );

        if (isMounted) {
            setMainStatProb(mainStatProbability);
            setSubstatProb(substatProbability);
            setValueProb(valuesProbability);
            setTotalProb(totalProbability);

            setResults({
                mainStat: {
                    name: mainStat,
                    probability: mainStatProbability.toFixed(4)
                },
                substats: selectedSubstats.map(stat => ({
                    name: stat,
                    value: substatValues[stat],
                    probability: calculateValueProbability(stat, substatValues[stat]).toFixed(4)
                })),
                substatComboProbability: substatProbability.toFixed(6),
                valuesProbability: valuesProbability.toFixed(6),
                totalProbability: totalProbability.toFixed(8)
            });

            setWaveplateInfo(null);
        }

        return cleanup;
    };

    // Calculate probabilities for rolling additional substats (Tab 2)
    const calculateRollProbability = () => {
        let isMounted = true;

        const cleanup = () => {
            isMounted = false;
        };

        // Main stat is already rolled, so probability is 100%
        const mainStatProbability = 100;

        const totalSubstatOptions = allSubstats.length;
        const existingCount = existingSubstats.length;
        const desiredCount = desiredSubstats.length;
        const remainingSlots = 5 - existingCount;

        if (desiredCount === 0) {
            if (isMounted) {
                setRollMainStatProb(mainStatProbability);
                setRollSubstatProb(100);
                setRollValueProb(100);
                setRollTotalProb(100);

                setRollResults({
                    mainStat: {
                        name: rollMainStat,
                        probability: mainStatProbability.toFixed(4)
                    },
                    desiredSubstats: [],
                    substatComboProbability: (100).toFixed(6),
                    valuesProbability: (100).toFixed(6),
                    totalProbability: (100).toFixed(8)
                });

                setRollWaveplateInfo(null);
            }
            return cleanup;
        }

        if (remainingSlots <= 0 || desiredCount > remainingSlots) {
            setRollResults({
                error: remainingSlots <= 0 ? "No more substat slots available." : "Desired substats exceed remaining slots."
            });
            setRollMainStatProb(0);
            setRollSubstatProb(0);
            setRollValueProb(0);
            setRollTotalProb(0);
            setRollWaveplateInfo(null);
            return cleanup;
        }

        // Calculate substat probability using the same method as Echo Calculator
        let substatProbability = 0;
        if (desiredCount > 0) {
            // Total sequences for the remaining rolls
            const totalSequences = permutation(totalSubstatOptions - existingCount, remainingSlots);

            // Favorable sequences: must include all desired substats in the remaining rolls
            let favorableSequences = 1;
            favorableSequences *= permutation(remainingSlots, desiredCount); // Ways to place desired substats in remaining slots
            const remainingAfterDesired = remainingSlots - desiredCount;
            for (let i = 0; i < remainingAfterDesired; i++) {
                favorableSequences *= (totalSubstatOptions - existingCount - desiredCount - i);
            }

            substatProbability = Math.min((favorableSequences / totalSequences) * 100, 100);
        } else {
            substatProbability = 100;
        }

        // Calculate value probability for desired substats
        let valuesProbability = 1;
        for (const stat of desiredSubstats) {
            const desiredValue = desiredSubstatValues[stat];
            const individualProb = calculateValueProbability(stat, desiredValue) / 100;
            valuesProbability *= individualProb;
        }
        valuesProbability = Math.min(valuesProbability * 100, 100);

        // Total probability
        const totalProbability = Math.min(
            (mainStatProbability / 100) *
            (substatProbability / 100) *
            (valuesProbability / 100) * 100,
            100
        );

        if (isMounted) {
            setRollMainStatProb(mainStatProbability);
            setRollSubstatProb(substatProbability);
            setRollValueProb(valuesProbability);
            setRollTotalProb(totalProbability);

            setRollResults({
                mainStat: {
                    name: rollMainStat,
                    probability: mainStatProbability.toFixed(4)
                },
                desiredSubstats: desiredSubstats.map(stat => ({
                    name: stat,
                    value: desiredSubstatValues[stat],
                    probability: calculateValueProbability(stat, desiredSubstatValues[stat]).toFixed(4)
                })),
                substatComboProbability: substatProbability.toFixed(6),
                valuesProbability: valuesProbability.toFixed(6),
                totalProbability: totalProbability.toFixed(8)
            });

            setRollWaveplateInfo(null);
        }

        return cleanup;
    };

    // Format percentage
    const formatPercent = (value) => {
        value = Math.min(value, 100);

        if (value === 100) {
            return "100%";
        } else if (value < 0.0001) {
            return value.toExponential(4) + "%";
        } else if (value < 0.01) {
            return value.toFixed(6) + "%";
        } else if (value < 1) {
            return value.toFixed(4) + "%";
        } else {
            return value.toFixed(2) + "%";
        }
    };

    // Calculate fraction for tooltip
    const getFraction = (prob) => {
        if (prob <= 0 || prob >= 100) return "N/A";
        const denominator = Math.round(100 / prob);
        return `1/${denominator}`;
    };

    // Calculate Waveplates
    const calculateWaveplates = (probability, setWaveplateInfoFunc, confidenceLevelValue) => {
        if (probability <= 0 || probability >= 100) {
            setWaveplateInfoFunc({
                message: "Probability is invalid for Waveplate calculation."
            });
            return;
        }

        const confidence = confidenceLevelValue / 100;
        if (confidence <= 0 || confidence >= 1) {
            setWaveplateInfoFunc({
                message: "Confidence level must be between 0 and 100%."
            });
            return;
        }

        const successProbability = probability / 100;
        const failureProbability = 1 - successProbability;
        const failureThreshold = 1 - confidence;
        const rollsNeeded = Math.ceil(Math.log(failureThreshold) / Math.log(failureProbability));

        const waveplatesPerRoll = 60 / 4;
        const totalWaveplates = rollsNeeded * waveplatesPerRoll;

        const totalMinutes = totalWaveplates * 6;
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = Math.floor(totalMinutes % 60);

        let timeString = '';
        if (days > 0) timeString += `${days} day${days !== 1 ? 's' : ''}`;
        if (hours > 0) {
            if (timeString) timeString += ', ';
            timeString += `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (timeString) timeString += ', ';
            timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        if (!timeString) timeString = '0 minutes';

        setWaveplateInfoFunc({
            waveplates: totalWaveplates,
            time: timeString,
            confidence: confidenceLevelValue
        });
    };

    // Chart data (Tab 1)
    const getChartData = () => {
        if (!results) return [];
        return [
            { name: 'Main Stat', value: parseFloat(results.mainStat.probability) },
            { name: 'Substats', value: parseFloat(results.substatComboProbability) },
            { name: 'Values', value: parseFloat(results.valuesProbability) }
        ];
    };

    // Chart data (Tab 2)
    const getRollChartData = () => {
        if (!rollResults || rollResults.error) return [];
        return [
            { name: 'Main Stat', value: parseFloat(rollResults.mainStat.probability) },
            { name: 'Substats', value: parseFloat(rollResults.substatComboProbability) },
            { name: 'Values', value: parseFloat(rollResults.valuesProbability) }
        ];
    };

    const CHART_COLORS = [colors.primary, colors.accent, colors.warning];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={colors.text}
                fontSize={12}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {`${name}: ${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    const getGradientColor = (prob, minProb, maxProb) => {
        const normalized = (prob - minProb) / (maxProb - minProb);
        const adjusted = Math.pow(normalized, 0.5);
        const red = Math.round(255 * (1 - adjusted));
        const green = Math.round(50 + (205 - 50) * adjusted);
        const blue = 0;
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const percentStatsWithIndex = percentStatProbabilities.map((prob, index) => ({
        prob,
        index: index + 1
    }));
    const flatStatsWithIndex = flatStatProbabilities.map((prob, index) => ({
        prob,
        index: index + 1
    }));

    const sortedPercentProbs = [...percentStatProbabilities].sort((a, b) => a - b);
    const sortedFlatProbs = [...flatStatProbabilities].sort((a, b) => a - b);

    const minPercentProb = sortedPercentProbs[0];
    const maxPercentProb = sortedPercentProbs[sortedPercentProbs.length - 1];
    const minFlatProb = sortedFlatProbs[0];
    const maxFlatProb = sortedFlatProbs[sortedFlatProbs.length - 1];

    const renderProbabilityBar = (prob, minProb, maxProb, index) => (
        <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 60px',
            alignItems: 'center',
            gap: '10px'
        }}>
            <span style={{ fontSize: '14px', color: colors.textDark }}>
                Tier {index + 1}:
            </span>
            <div style={{ height: '20px', backgroundColor: colors.inputBg, borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${prob}%`, height: '100%', backgroundColor: getGradientColor(prob, minProb, maxProb), borderRadius: '4px' }} />
            </div>
            <span style={{ fontSize: '12px', color: colors.text, textAlign: 'right', cursor: 'pointer', position: 'relative' }}>
                {formatPercent(prob)}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    visibility: 'hidden',
                    pointerEvents: 'none'
                }}
                    className="probability-tooltip"
                >
                    {getFraction(prob)}
                </div>
            </span>
        </div>
    );

    return (
        <div style={{
            backgroundColor: colors.background,
            color: colors.text,
            fontFamily: "'Segoe UI', sans-serif",
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '1000px',
                width: '100%',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: colors.accent,
                    fontSize: '28px',
                    marginBottom: '5px'
                }}>
                    Wuthering Waves Echo Calculator
                </h1>
                <h2 style={{
                    textAlign: 'center',
                    color: colors.primary,
                    fontSize: '16px',
                    fontWeight: 'normal',
                    marginTop: 0
                }}>
                    Calculate your odds of getting the perfect Echo
                </h2>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '20px 0'
                }}>
                    <button
                        onClick={() => setActiveTab('echoCalculator')}
                        style={{
                            backgroundColor: activeTab === 'echoCalculator' ? colors.buttonBg : colors.inputBg,
                            color: colors.buttonText,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginRight: '10px'
                        }}
                    >
                        Echo Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab('substatRollCalculator')}
                        style={{
                            backgroundColor: activeTab === 'substatRollCalculator' ? colors.buttonBg : colors.inputBg,
                            color: colors.buttonText,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Substat Roll Calculator
                    </button>
                </div>

                {activeTab === 'echoCalculator' ? (
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                        <div style={{
                            flex: 1,
                            backgroundColor: colors.cardBg,
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{
                                color: colors.text,
                                marginTop: 0,
                                marginBottom: '20px',
                                fontSize: '18px'
                            }}>
                                Echo Parameters
                            </h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Echo Cost:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {echoCosts.map(cost => (
                                        <button
                                            key={cost}
                                            onClick={() => setEchoCost(cost)}
                                            style={{
                                                backgroundColor: echoCost === cost ? colors.buttonBg : colors.inputBg,
                                                color: colors.buttonText,
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: echoCost === cost ? 'bold' : 'normal'
                                            }}
                                        >
                                            {cost} Cost
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Main Stat:
                                </label>
                                <select
                                    value={mainStat}
                                    onChange={(e) => setMainStat(e.target.value)}
                                    style={{
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        width: '100%'
                                    }}
                                >
                                    {mainStatsByCost[echoCost]?.map(stat => (
                                        <option key={stat} value={stat}>{stat}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Substats (select up to 5, no duplicates):
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                }}>
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    {allSubstats.map(stat => (
                                        <div
                                            key={stat}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: selectedSubstats.includes(stat) ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                cursor: selectedSubstats.includes(stat) || selectedSubstats.length >= 5 ? 'not-allowed' : 'pointer',
                                                opacity: selectedSubstats.includes(stat) || selectedSubstats.length >= 5 ? 0.5 : 1
                                            }}
                                            onClick={() => toggleSubstat(stat)}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '3px',
                                                border: `1px solid ${colors.textDark}`,
                                                backgroundColor: selectedSubstats.includes(stat) ? colors.primary : 'transparent',
                                                marginRight: '8px'
                                            }} />
                                            <span>{stat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedSubstats.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                        Minimum Substat Values:
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedSubstats.map(stat => (
                                            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '180px', fontSize: '14px' }}>{stat}:</span>
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={substatValues[stat] || substatRanges[stat].min}
                                                        onChange={(e) => handleSubstatValueChange(stat, e.target.value)}
                                                        style={{
                                                            backgroundColor: colors.inputBg,
                                                            color: colors.text,
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            width: '80px'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '5px' }}>
                                                        <button
                                                            onClick={() => handleSubstatValueChange(stat, substatValues[stat], 'up')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={() => handleSubstatValueChange(stat, substatValues[stat], 'down')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '12px', color: colors.textDark }}>
                                                    Range: {substatRanges[stat].min} - {substatRanges[stat].max}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={calculateProbability}
                                style={{
                                    backgroundColor: colors.buttonBg,
                                    color: colors.buttonText,
                                    padding: '12px 24px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    width: '100%',
                                    marginTop: '10px'
                                }}
                            >
                                Calculate Probability
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            backgroundColor: colors.cardBg,
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{
                                color: colors.text,
                                marginTop: 0,
                                marginBottom: '20px',
                                fontSize: '18px'
                            }}>
                                Results
                            </h3>

                            {!results ? (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.textDark,
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <p>Select your desired Echo parameters and click "Calculate Probability" to see results.</p>
                                </div>
                            ) : (
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            backgroundColor: 'rgba(88, 166, 255, 0.1)',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                <div>
                                                    <h4 style={{
                                                        margin: '0 0 10px 0',
                                                        color: colors.accent,
                                                        fontSize: '16px'
                                                    }}>
                                                        Total Probability
                                                    </h4>
                                                    <div style={{
                                                        fontSize: '24px',
                                                        fontWeight: 'bold',
                                                        color: totalProb < 0.01 ? colors.error : colors.success,
                                                        position: 'relative'
                                                    }}>
                                                        <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                            {formatPercent(totalProb)}
                                                        </span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-30px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            backgroundColor: colors.inputBg,
                                                            color: colors.text,
                                                            padding: '5px 10px',
                                                            borderRadius: '5px',
                                                            fontSize: '12px',
                                                            visibility: 'hidden',
                                                            pointerEvents: 'none'
                                                        }}
                                                            className="probability-tooltip"
                                                        >
                                                            {getFraction(totalProb)}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: colors.textDark, marginTop: '5px' }}>
                                                        {totalProb < 0.0001 ?
                                                            "Extremely rare! You might need thousands of attempts." :
                                                            totalProb < 0.01 ?
                                                                "Very rare. Good luck finding this Echo!" :
                                                                totalProb < 1 ?
                                                                    "Uncommon, but possible with dedication." :
                                                                    "Achievable with some persistence."
                                                        }
                                                    </div>
                                                </div>
                                                {(echoCost === 1 || echoCost === 3) && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <label style={{ fontSize: '12px', color: colors.text }}>
                                                                Confidence (%):
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={confidenceLevel}
                                                                onChange={(e) => setConfidenceLevel(Math.max(0, Math.min(99.99, parseFloat(e.target.value) || 0)))}
                                                                style={{
                                                                    backgroundColor: colors.inputBg,
                                                                    color: colors.text,
                                                                    padding: '5px',
                                                                    borderRadius: '5px',
                                                                    border: 'none',
                                                                    width: '60px',
                                                                    fontSize: '12px'
                                                                }}
                                                                min="0"
                                                                max="99.99"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => calculateWaveplates(totalProb, setWaveplateInfo, confidenceLevel)}
                                                            style={{
                                                                backgroundColor: colors.buttonBg,
                                                                color: colors.buttonText,
                                                                padding: '8px 16px',
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Approximate Needed Waveplates
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {waveplateInfo && (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: waveplateInfo.message ? colors.error : colors.text,
                                                    marginTop: '5px'
                                                }}>
                                                    {waveplateInfo.message ? (
                                                        waveplateInfo.message
                                                    ) : (
                                                        `Approximate Waveplates Needed for ${waveplateInfo.confidence}% Confidence: ${waveplateInfo.waveplates} (${waveplateInfo.time})`
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Main Stat ({mainStat}):</span>
                                                <span style={{ color: colors.primary, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(mainStatProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(mainStatProb)}
                                                    </div>
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Substat Combination:</span>
                                                <span style={{ color: colors.accent, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(substatProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(substatProb)}
                                                    </div>
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Substat Value Thresholds:</span>
                                                <span style={{ color: colors.warning, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(valueProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(valueProb)}
                                                    </div>
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <h4 style={{
                                                margin: '0 0 10px 0',
                                                color: colors.text,
                                                fontSize: '14px'
                                            }}>
                                                Individual Substat Value Probabilities:
                                            </h4>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                fontSize: '13px'
                                            }}>
                                                {results.substats.map(stat => (
                                                    <div key={stat.name} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        padding: '5px 10px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <span>{stat.name} ≥ {stat.value}</span>
                                                        <span style={{ color: parseFloat(stat.probability) < 50 ? colors.warning : colors.success, position: 'relative' }}>
                                                            <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                                {formatPercent(parseFloat(stat.probability))}
                                                            </span>
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-30px',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                backgroundColor: colors.inputBg,
                                                                color: colors.text,
                                                                padding: '5px 10px',
                                                                borderRadius: '5px',
                                                                fontSize: '12px',
                                                                visibility: 'hidden',
                                                                pointerEvents: 'none'
                                                            }}
                                                                className="probability-tooltip"
                                                            >
                                                                {getFraction(parseFloat(stat.probability))}
                                                            </div>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{
                                            height: '200px',
                                            marginTop: '20px'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 10px 0',
                                                color: colors.text,
                                                fontSize: '14px',
                                                textAlign: 'center'
                                            }}>
                                                Probability Breakdown
                                            </h4>
                                            <ResponsiveContainer width="100%" height="90%">
                                                <PieChart>
                                                    <Pie
                                                        data={getChartData()}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={70}
                                                        fill="#8884d8"
                                                        label={renderCustomLabel}
                                                        labelLine={true}
                                                    >
                                                        {getChartData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [formatPercent(value), "Probability"]} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                        <div style={{
                            flex: 1,
                            backgroundColor: colors.cardBg,
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{
                                color: colors.text,
                                marginTop: 0,
                                marginBottom: '20px',
                                fontSize: '18px'
                            }}>
                                Current Echo Parameters
                            </h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Echo Cost:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {echoCosts.map(cost => (
                                        <button
                                            key={cost}
                                            onClick={() => setRollEchoCost(cost)}
                                            style={{
                                                backgroundColor: rollEchoCost === cost ? colors.buttonBg : colors.inputBg,
                                                color: colors.buttonText,
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: rollEchoCost === cost ? 'bold' : 'normal'
                                            }}
                                        >
                                            {cost} Cost
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Main Stat:
                                </label>
                                <select
                                    value={rollMainStat}
                                    onChange={(e) => setRollMainStat(e.target.value)}
                                    style={{
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        width: '100%'
                                    }}
                                >
                                    {mainStatsByCost[rollEchoCost]?.map(stat => (
                                        <option key={stat} value={stat}>{stat}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Existing Substats (select up to 5, no duplicates):
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                }}>
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    {allSubstats.map(stat => (
                                        <div
                                            key={stat}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: existingSubstats.includes(stat) ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                cursor: existingSubstats.includes(stat) || existingSubstats.length >= 5 ? 'not-allowed' : 'pointer',
                                                opacity: existingSubstats.includes(stat) || existingSubstats.length >= 5 ? 0.5 : 1
                                            }}
                                            onClick={() => toggleExistingSubstat(stat)}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '3px',
                                                border: `1px solid ${colors.textDark}`,
                                                backgroundColor: existingSubstats.includes(stat) ? colors.primary : 'transparent',
                                                marginRight: '8px'
                                            }} />
                                            <span>{stat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {existingSubstats.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                        Existing Substat Values:
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {existingSubstats.map(stat => (
                                            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '180px', fontSize: '14px' }}>{stat}:</span>
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={existingSubstatValues[stat] || substatRanges[stat].min}
                                                        onChange={(e) => handleExistingSubstatValueChange(stat, e.target.value)}
                                                        style={{
                                                            backgroundColor: colors.inputBg,
                                                            color: colors.text,
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            width: '80px'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '5px' }}>
                                                        <button
                                                            onClick={() => handleExistingSubstatValueChange(stat, existingSubstatValues[stat], 'up')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={() => handleExistingSubstatValueChange(stat, existingSubstatValues[stat], 'down')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '12px', color: colors.textDark }}>
                                                    Range: {substatRanges[stat].min} - {substatRanges[stat].max}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                    Desired Substats to Roll (remaining slots: {5 - existingSubstats.length}):
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    padding: '5px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                }}>
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    {allSubstats.map(stat => (
                                        <div
                                            key={stat}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: desiredSubstats.includes(stat) ? 'rgba(255, 182, 193, 0.2)' : 'transparent',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                cursor: existingSubstats.includes(stat) || desiredSubstats.length >= (5 - existingSubstats.length) || desiredSubstats.includes(stat) ? 'not-allowed' : 'pointer',
                                                opacity: existingSubstats.includes(stat) || desiredSubstats.length >= (5 - existingSubstats.length) || desiredSubstats.includes(stat) ? 0.5 : 1
                                            }}
                                            onClick={() => toggleDesiredSubstat(stat)}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '3px',
                                                border: `1px solid ${colors.textDark}`,
                                                backgroundColor: desiredSubstats.includes(stat) ? colors.limited : 'transparent',
                                                marginRight: '8px'
                                            }} />
                                            <span>{stat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {desiredSubstats.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                                        Desired Substat Minimum Values:
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {desiredSubstats.map(stat => (
                                            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '180px', fontSize: '14px' }}>{stat}:</span>
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={desiredSubstatValues[stat] || substatRanges[stat].min}
                                                        onChange={(e) => handleDesiredSubstatValueChange(stat, e.target.value)}
                                                        style={{
                                                            backgroundColor: colors.inputBg,
                                                            color: colors.text,
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            width: '80px'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '5px' }}>
                                                        <button
                                                            onClick={() => handleDesiredSubstatValueChange(stat, desiredSubstatValues[stat], 'up')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={() => handleDesiredSubstatValueChange(stat, desiredSubstatValues[stat], 'down')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: colors.text,
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '12px', color: colors.textDark }}>
                                                    Range: {substatRanges[stat].min} - {substatRanges[stat].max}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={calculateRollProbability}
                                style={{
                                    backgroundColor: colors.buttonBg,
                                    color: colors.buttonText,
                                    padding: '12px 24px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    width: '100%',
                                    marginTop: '10px'
                                }}
                            >
                                Calculate Roll Probability
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            backgroundColor: colors.cardBg,
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{
                                color: colors.text,
                                marginTop: 0,
                                marginBottom: '20px',
                                fontSize: '18px'
                            }}>
                                Roll Results
                            </h3>

                            {!rollResults ? (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.textDark,
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <p>Specify your Echo's current stats and desired substats, then click "Calculate Roll Probability" to see results.</p>
                                </div>
                            ) : rollResults.error ? (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.error,
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <p>{rollResults.error}</p>
                                </div>
                            ) : (
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            backgroundColor: 'rgba(88, 166, 255, 0.1)',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                <div>
                                                    <h4 style={{
                                                        margin: '0 0 10px 0',
                                                        color: colors.accent,
                                                        fontSize: '16px'
                                                    }}>
                                                        Total Roll Probability
                                                    </h4>
                                                    <div style={{
                                                        fontSize: '24px',
                                                        fontWeight: 'bold',
                                                        color: rollTotalProb < 0.01 ? colors.error : colors.success,
                                                        position: 'relative'
                                                    }}>
                                                        <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                            {formatPercent(rollTotalProb)}
                                                        </span>
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-30px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            backgroundColor: colors.inputBg,
                                                            color: colors.text,
                                                            padding: '5px 10px',
                                                            borderRadius: '5px',
                                                            fontSize: '12px',
                                                            visibility: 'hidden',
                                                            pointerEvents: 'none'
                                                        }}
                                                            className="probability-tooltip"
                                                        >
                                                            {getFraction(rollTotalProb)}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: colors.textDark, marginTop: '5px' }}>
                                                        {rollTotalProb < 0.0001 ?
                                                            "Extremely rare! You might need thousands of attempts." :
                                                            rollTotalProb < 0.01 ?
                                                                "Very rare. Good luck rolling these substats!" :
                                                                rollTotalProb < 1 ?
                                                                    "Uncommon, but possible with dedication." :
                                                                    "Achievable with some persistence."
                                                        }
                                                    </div>
                                                </div>
                                                {(rollEchoCost === 1 || rollEchoCost === 3) && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <label style={{ fontSize: '12px', color: colors.text }}>
                                                                Confidence (%):
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={rollConfidenceLevel}
                                                                onChange={(e) => setRollConfidenceLevel(Math.max(0, Math.min(99.99, parseFloat(e.target.value) || 0)))}
                                                                style={{
                                                                    backgroundColor: colors.inputBg,
                                                                    color: colors.text,
                                                                    padding: '5px',
                                                                    borderRadius: '5px',
                                                                    border: 'none',
                                                                    width: '60px',
                                                                    fontSize: '12px'
                                                                }}
                                                                min="0"
                                                                max="99.99"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => calculateWaveplates(rollTotalProb, setRollWaveplateInfo, rollConfidenceLevel)}
                                                            style={{
                                                                backgroundColor: colors.buttonBg,
                                                                color: colors.buttonText,
                                                                padding: '8px 16px',
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Approximate Needed Waveplates
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {rollWaveplateInfo && (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: rollWaveplateInfo.message ? colors.error : colors.text,
                                                    marginTop: '5px'
                                                }}>
                                                    {rollWaveplateInfo.message ? (
                                                        rollWaveplateInfo.message
                                                    ) : (
                                                        `Approximate Waveplates Needed for ${rollWaveplateInfo.confidence}% Confidence: ${rollWaveplateInfo.waveplates} (${rollWaveplateInfo.time})`
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Main Stat ({rollMainStat}):</span>
                                                <span style={{ color: colors.primary, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(rollMainStatProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(rollMainStatProb)}
                                                    </div>
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Substat Combination:</span>
                                                <span style={{ color: colors.accent, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(rollSubstatProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(rollSubstatProb)}
                                                    </div>
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span>Substat Value Thresholds:</span>
                                                <span style={{ color: colors.warning, position: 'relative' }}>
                                                    <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                        {formatPercent(rollValueProb)}
                                                    </span>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: colors.inputBg,
                                                        color: colors.text,
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        fontSize: '12px',
                                                        visibility: 'hidden',
                                                        pointerEvents: 'none'
                                                    }}
                                                        className="probability-tooltip"
                                                    >
                                                        {getFraction(rollValueProb)}
                                                    </div>
                                                </span>
                                            </div>
                                        </div>

                                        {desiredSubstats.length > 0 && (
                                            <div style={{ marginTop: '20px' }}>
                                                <h4 style={{
                                                    margin: '0 0 10px 0',
                                                    color: colors.text,
                                                    fontSize: '14px'
                                                }}>
                                                    Desired Substat Value Probabilities:
                                                </h4>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    fontSize: '13px'
                                                }}>
                                                    {rollResults.desiredSubstats.map(stat => (
                                                        <div key={stat.name} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '5px 10px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                            borderRadius: '5px'
                                                        }}>
                                                            <span>{stat.name} ≥ {stat.value}</span>
                                                            <span style={{ color: parseFloat(stat.probability) < 50 ? colors.warning : colors.success, position: 'relative' }}>
                                                                <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                                    {formatPercent(parseFloat(stat.probability))}
                                                                </span>
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '-30px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)',
                                                                    backgroundColor: colors.inputBg,
                                                                    color: colors.text,
                                                                    padding: '5px 10px',
                                                                    borderRadius: '5px',
                                                                    fontSize: '12px',
                                                                    visibility: 'hidden',
                                                                    pointerEvents: 'none'
                                                                }}
                                                                    className="probability-tooltip"
                                                                >
                                                                    {getFraction(parseFloat(stat.probability))}
                                                                </div>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{
                                            height: '200px',
                                            marginTop: '20px'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 10px 0',
                                                color: colors.text,
                                                fontSize: '14px',
                                                textAlign: 'center'
                                            }}>
                                                Probability Breakdown
                                            </h4>
                                            <ResponsiveContainer width="100%" height="90%">
                                                <PieChart>
                                                    <Pie
                                                        data={getRollChartData()}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={70}
                                                        fill="#8884d8"
                                                        label={renderCustomLabel}
                                                        labelLine={true}
                                                    >
                                                        {getRollChartData().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [formatPercent(value), "Probability"]} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{
                    backgroundColor: colors.cardBg,
                    borderRadius: '20px',
                    padding: '20px',
                    marginTop: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        color: colors.text,
                        marginTop: 0,
                        marginBottom: '10px',
                        fontSize: '18px'
                    }}>
                        Echo Substat Information
                    </h3>
                    <p style={{
                        color: colors.textDark,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0 0 10px 0'
                    }}>
                        • Substat ranges are the same for all Echo rarities<br />
                        • Each Echo can have up to 5 substats<br />
                        • Substats cannot repeat within the same Echo<br />
                        • Substat values are randomly distributed according to the probability tiers shown in the game<br />
                        • The calculator uses real distribution data from the game to provide accurate probability estimates
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '15px',
                        padding: '10px'
                    }}>
                        <div style={{ width: '100%', marginBottom: '20px' }}>
                            <h4 style={{
                                color: colors.text,
                                fontSize: '16px',
                                marginBottom: '10px'
                            }}>
                                Percentage-Based Substats Distribution
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                {percentStatsWithIndex.map(({ prob, index }) => renderProbabilityBar(prob, minPercentProb, maxPercentProb, index - 1))}
                            </div>
                        </div>

                        <div style={{ width: '100%' }}>
                            <h4 style={{
                                color: colors.text,
                                fontSize: '16px',
                                marginBottom: '10px'
                            }}>
                                Flat Substats Distribution (HP, ATK, DEF)
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                {flatStatsWithIndex.map(({ prob, index }) => renderProbabilityBar(prob, minFlatProb, maxFlatProb, index - 1))}
                            </div>
                        </div>

                        <style jsx>{`
                            .probability-tooltip {
                                visibility: hidden;
                            }
                            span:hover .probability-tooltip {
                                visibility: visible;
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WutheringWavesEchoCalculator;