import { DatasetAnalytics, AgentOptimizationPlan, ActionTask, AgentExecutionLog } from '../../src/types/energy';
import { executeTool } from '../tools/executor';

export type SupportedLocale = 'en' | 'hi' | 'mr';

/**
 * Deterministic Fallback Agent
 * Used when Gemini API is offline, key is unconfigured, or bounded execution times out.
 * Employs deterministic rule heuristics and genuine tool execution into session memory.
 * Fully localized in English, Hindi, and Marathi.
 */
export async function generateDeterministicOptimizationPlan(
  analytics: DatasetAnalytics,
  objective: string = 'Maximize Energy Conservation',
  tariff: number = 0.20,
  locale: SupportedLocale = 'en'
): Promise<AgentOptimizationPlan> {
  const startTime = Date.now();
  const logs: AgentExecutionLog[] = [];
  const draftTasks: ActionTask[] = [];

  const initLogContent: Record<SupportedLocale, string> = {
    en: `Initializing Deterministic Energy Optimization Engine for objective: "${objective}". Fallback mode engaged.`,
    hi: `स्वायत्त ऊर्जा अनुकूलन इंजन प्रारंभ हो रहा है: "${objective}". नियम-आधारित मोड सक्रिय.`,
    mr: `स्वायत्त ऊर्जा ऑप्टिमायझेशन इंजिन सुरू होत आहे: "${objective}". नियम-आधारित मोड सक्रिय.`,
  };

  logs.push({
    id: `log-${Date.now()}-1`,
    timestamp: new Date().toISOString(),
    type: 'system',
    content: initLogContent[locale] || initLogContent.en,
  });

  // Step 1: Tool Call - Inspect Energy Data for high severity anomalies
  logs.push({
    id: `log-${Date.now()}-2`,
    timestamp: new Date().toISOString(),
    type: 'tool_call',
    toolName: 'inspect_energy_data',
    toolArgs: { zone: 'all', time_window: 'all', anomaly_type: 'all' },
    content:
      locale === 'hi'
        ? 'सभी परिसर सुविधाओं में विसंगतियों और निष्कर्षों का मूल्यांकन किया जा रहा है।'
        : locale === 'mr'
        ? 'सर्व परिसर इमारतींमधील विसंगती आणि निष्कर्षांचे मूल्यांकन केले जात आहे.'
        : 'Evaluating validated anomaly findings and baselines across all monitored campus facilities.',
  });

  const inspectResult = await executeTool(
    'inspect_energy_data',
    { zone: 'all', time_window: 'all', anomaly_type: 'all' },
    analytics,
    draftTasks
  );

  logs.push({
    id: `log-${Date.now()}-3`,
    timestamp: new Date().toISOString(),
    type: 'tool_result',
    toolName: 'inspect_energy_data',
    toolResult: inspectResult.result,
    content:
      locale === 'hi'
        ? `${inspectResult.result?.anomalyCount ?? 0} सत्यापित विसंगतियां मिलीं, जो ${Number(inspectResult.result?.totalWasteKwhInScope ?? 0).toFixed(1)} kWh रोके जाने योग्य अपव्यय दर्शाती हैं।`
        : locale === 'mr'
        ? `${inspectResult.result?.anomalyCount ?? 0} सत्यापित विसंगती आढळल्या, ज्या ${Number(inspectResult.result?.totalWasteKwhInScope ?? 0).toFixed(1)} kWh टाळता येणारा अपव्यय दर्शवतात.`
        : `Retrieved ${inspectResult.result?.anomalyCount ?? 0} verified anomaly findings representing ${Number(inspectResult.result?.totalWasteKwhInScope ?? 0).toFixed(1)} kWh of avoidable energy waste.`,
  });

  // Step 2: Tool Call - Calculate Savings Scenario (15% reduction scenario)
  logs.push({
    id: `log-${Date.now()}-4`,
    timestamp: new Date().toISOString(),
    type: 'tool_call',
    toolName: 'calculate_savings_scenario',
    toolArgs: { target_reduction_pct: 15, electricity_tariff: tariff },
    content:
      locale === 'hi'
        ? '15% अपव्यय कटौती परिदृश्य के अंतर्गत लागत और ऊर्जा बचत की गणना की जा रही है।'
        : locale === 'mr'
        ? '15% अपव्यय कपात परिस्थिती अंतर्गत खर्च आणि ऊर्जा बचतीची गणना केली जात आहे.'
        : 'Calculating energy and cost reduction potential under a 15% remediation scenario.',
  });

  const savingsResult = await executeTool(
    'calculate_savings_scenario',
    { target_reduction_pct: 15, electricity_tariff: tariff },
    analytics,
    draftTasks
  );

  logs.push({
    id: `log-${Date.now()}-5`,
    timestamp: new Date().toISOString(),
    type: 'tool_result',
    toolName: 'calculate_savings_scenario',
    toolResult: savingsResult.result,
    content:
      locale === 'hi'
        ? `बचत मॉडल: तात्कालिक कटौती ${savingsResult.result?.achievableEnergySavingsKwh} kWh ($${savingsResult.result?.estimatedCostSavings}), वार्षिक अनुमानित $${savingsResult.result?.annualCostSavings}।`
        : locale === 'mr'
        ? `बचत मॉडेल: त्वरित कपात ${savingsResult.result?.achievableEnergySavingsKwh} kWh ($${savingsResult.result?.estimatedCostSavings}), वार्षिक अंदाजित $${savingsResult.result?.annualCostSavings}.`
        : `Deterministic savings model: Potential immediate reduction of ${savingsResult.result?.achievableEnergySavingsKwh} kWh ($${savingsResult.result?.estimatedCostSavings}), scaling to $${savingsResult.result?.annualCostSavings}/yr.`,
  });

  // Step 3: Synthesize maintenance tasks for the top anomalies
  const highSeverityAnomalies = analytics.anomalies.filter((a) => a.severity === 'high');
  const anomaliesToProcess = (highSeverityAnomalies.length > 0 ? highSeverityAnomalies : analytics.anomalies).slice(0, 4);

  for (const anomaly of anomaliesToProcess) {
    let taskTitle = `Remediate ${anomaly.ruleLabel} in ${anomaly.zone}`;
    let category: ActionTask['category'] = 'operational_policy';
    let effort: ActionTask['implementationEffort'] = 'low';
    let steps: string[] = [];

    if (anomaly.rule === 'off_hours_waste') {
      if (locale === 'hi') {
        taskTitle = `${anomaly.zone} में रात्रि कालीन HVAC सेटपॉइंट और लाइटिंग सुधार`;
        steps = [
          `22:00 से 06:00 के बीच ${anomaly.zone} के लिए बिल्डिंग ऑटोमेशन सिस्टम (BAS) शेड्यूल की पुष्टि करें।`,
          'शून्य-उपस्थिति अंतराल के दौरान 4°F सेटबैक डेडबैंड लागू करें।',
          'स्वचालित लाइट शटऑफ की पुष्टि के लिए रात की लाइटिंग जांचें।',
        ];
      } else if (locale === 'mr') {
        taskTitle = `${anomaly.zone} मध्ये रात्रीचे HVAC सेटपॉइंट आणि लाइटिंग सुधारणा`;
        steps = [
          `22:00 ते 06:00 दरम्यान ${anomaly.zone} साठी बिल्डिंग ऑटोमेशन सिस्टम (BAS) वेळापत्रक तपासा.`,
          'कोणीही उपस्थित नसलेल्या वेळेत 4°F सेटबॅक डेडबँड लागू करा.',
          'स्वयंचलित दिवे बंद असल्याची खात्री करण्यासाठी रात्रीची तपासणी करा.',
        ];
      } else {
        taskTitle = `Nighttime HVAC Setback & Lighting Audit in ${anomaly.zone}`;
        steps = [
          `Verify Building Automation System (BAS) schedule for ${anomaly.zone} between 22:00 and 06:00.`,
          'Enforce 4°F setback deadband during zero-occupancy overnight intervals.',
          'Inspect custodial lighting sweep overrides to verify automated shutoff.',
        ];
      }
      category = 'hvac_scheduling';
      effort = 'low';
    } else if (anomaly.rule === 'statistical_spike') {
      if (locale === 'hi') {
        taskTitle = `${anomaly.zone} में यांत्रिक लोड वृद्धि और मोटर स्टार्टिंग की जांच`;
        steps = [
          `${new Date(anomaly.timestamp).toLocaleTimeString()} के आसपास मोटर या चिलर कंप्रेसर के अचानक शुरू होने की जांच करें।`,
          'अचानक लोड से बचने के लिए वेरिएबल फ़्रीक्वेंसी ड्राइव (VFD) रैंप-अप कर्व सत्यापित करें।',
          'मैकेनिकल साइकलिंग दोषों के लिए कूलिंग लूप प्रेशर सेंसर का निरीक्षण करें।',
        ];
      } else if (locale === 'mr') {
        taskTitle = `${anomaly.zone} मध्ये यांत्रिक लोड वाढ आणि मोटर स्टार्टिंग तपासणी`;
        steps = [
          `${new Date(anomaly.timestamp).toLocaleTimeString()} च्या सुमारास मोटर किंवा चिलर कंप्रेसरच्या अचानक सुरू होण्याच्या नोंदी तपासा.`,
          'अचानक लोड वाढ टाळण्यासाठी व्हेरिएबल फ्रिक्वेन्सी ड्राइव्ह (VFD) रॅम्प-अप कर्व तपासा.',
          'मेकॅनिकल सायकलिंग दोषांसाठी कूलिंग लूप प्रेशर सेन्सर्सची तपासणी करा.',
        ];
      } else {
        taskTitle = `Investigate Mechanical Surge & Staging in ${anomaly.zone}`;
        steps = [
          `Review submeter log around ${new Date(anomaly.timestamp).toLocaleTimeString()} for abrupt motor or chiller compressor starts.`,
          'Verify Variable Frequency Drive (VFD) ramp-up curves to eliminate simultaneous motor inrush currents.',
          'Inspect cooling loop pressure sensors for mechanical cycling faults.',
        ];
      }
      category = 'equipment_fault';
      effort = 'medium';
    } else if (anomaly.rule === 'weekend_ghost_load') {
      if (locale === 'hi') {
        taskTitle = `${anomaly.zone} में सप्ताहांत न्यूनतम-उपस्थिति सेटपॉइंट लागू करें`;
        steps = [
          `${anomaly.zone} के डिजिटल कंट्रोल लूप में सप्ताहांत अनअक्यूपाइड मोड प्रोग्राम करें।`,
          'सत्यापित करें कि शनिवार और रविवार को निकास पंखे और द्वितीयक एयर हैंडलर बंद रहें।',
          'प्लग लोड और वेंडिंग मशीनों की पावर सेटिंग्स का ऑडिट करें।',
        ];
      } else if (locale === 'mr') {
        taskTitle = `${anomaly.zone} मध्ये शनिवार-रविवार कमी-उपस्थिती सेटपॉइंट लागू करा`;
        steps = [
          `${anomaly.zone} च्या डिजिटल कंट्रोल लूपमध्ये शनिवार-रविवार अनऑक्युपाइड मोड प्रोग्राम करा.`,
          'शनिवार आणि रविवारी एक्झॉस्ट फॅन आणि दुय्यम एअर हँडलर्स बंद असल्याची खात्री करा.',
          'प्लग लोड आणि व्हेंडिंग मशिन पॉवर सेटिंग्सचे ऑडिट करा.',
        ];
      } else {
        taskTitle = `Implement Weekend Low-Occupancy Setpoint in ${anomaly.zone}`;
        steps = [
          `Program weekend unoccupied mode in digital control loop for ${anomaly.zone}.`,
          'Verify exhaust fans and secondary air handlers cycle off during Saturdays and Sundays.',
          'Audit plug loads and vending machine power misconfigurations.',
        ];
      }
      category = 'operational_policy';
      effort = 'low';
    } else {
      if (locale === 'hi') {
        taskTitle = `${anomaly.zone} के लिए बेस लोड बहाव अंशांकन`;
        steps = [
          'अवांछित बेस लोड की पहचान करने के लिए सब-सर्किट अलगाव परीक्षण करें।',
          'चिल्ड वाटर वाल्व की स्थिति की जांच करें।',
        ];
      } else if (locale === 'mr') {
        taskTitle = `${anomaly.zone} साठी बेस लोड ड्रिफ्ट कॅलिब्रेशन`;
        steps = [
          'नको असलेला बेस लोड ओळखण्यासाठी सब-सर्किट आयसोलेशन चाचणी करा.',
          'चिल्ड वॉटर व्हॉल्व्ह पोझिशनिंग तपासा.',
        ];
      } else {
        taskTitle = `Basal Load Drift Calibration for ${anomaly.zone}`;
        steps = [
          'Perform sub-circuit isolation test to identify unmetered parasitic base load.',
          'Inspect chilled water valve positioning for stuck-open actuator faults.',
        ];
      }
      category = 'submetering';
      effort = 'medium';
    }

    const taskArgs = {
      finding_id: anomaly.id,
      zone: anomaly.zone,
      title: taskTitle,
      urgency: anomaly.severity === 'high' ? 'high' : 'medium',
      category,
      recommended_steps: steps,
      estimated_kwh_reduction: Number((anomaly.excessKwh * 0.85).toFixed(1)),
      implementation_effort: effort,
      confidence_score: 0.92,
      rationale: anomaly.explanation,
    };

    logs.push({
      id: `log-${Date.now()}-${anomaly.id}`,
      timestamp: new Date().toISOString(),
      type: 'tool_call',
      toolName: 'draft_maintenance_task',
      toolArgs: taskArgs,
      content:
        locale === 'hi'
          ? `${anomaly.zone} के लिए सुविधा हस्तक्षेप कार्य का मसौदा तैयार किया जा रहा है।`
          : locale === 'mr'
          ? `${anomaly.zone} साठी सुविधा कृतीचा मसुदा तयार केला जात आहे.`
          : `Drafting actionable verification task for ${anomaly.zone}.`,
    });

    const draftResult = await executeTool('draft_maintenance_task', taskArgs, analytics, draftTasks);

    logs.push({
      id: `log-${Date.now()}-${anomaly.id}-res`,
      timestamp: new Date().toISOString(),
      type: 'tool_result',
      toolName: 'draft_maintenance_task',
      toolResult: draftResult.result,
      content:
        locale === 'hi'
          ? `प्रस्तावित कार्य ${draftResult.result?.taskId}: "${taskTitle}" तैयार किया गया।`
          : locale === 'mr'
          ? `प्रस्तावित कृती ${draftResult.result?.taskId}: "${taskTitle}" तयार करण्यात आली.`
          : `Created draft task ${draftResult.result?.taskId}: "${taskTitle}".`,
    });
  }

  logs.push({
    id: `log-${Date.now()}-final`,
    timestamp: new Date().toISOString(),
    type: 'output',
    content:
      locale === 'hi'
        ? `अनुकूलन योजना पूर्ण हुई। ${draftTasks.length} समीक्षा योग्य कार्य तैयार किए गए जो ${analytics.totalWasteKwh} kWh मापे गए अपव्यय को लक्षित करते हैं।`
        : locale === 'mr'
        ? `ऑप्टिमायझेशन योजना पूर्ण झाली. ${draftTasks.length} पुनरावलोकन योग्य कृती तयार केल्या ज्या ${analytics.totalWasteKwh} kWh मोजलेल्या अपव्ययाला लक्ष्य करतात.`
        : `Completed optimization plan. Prepared ${draftTasks.length} reviewable actions targeting ${analytics.totalWasteKwh} kWh of measured waste.`,
  });

  const durationMs = Date.now() - startTime;

  let strategySummary = `WattWise Rule Engine analyzed ${analytics.readingsCount} readings across ${analytics.zoneCount} facilities. Detected ${analytics.anomalies.length} verifiable anomaly events representing ${analytics.totalWasteKwh} kWh of excess consumption over baseline. Targeted interventions focus primarily on overnight unmanaged HVAC loads and unoccupied weekend operation.`;
  let identifiedWasteSummary = `Identified ${analytics.totalWasteKwh} kWh avoidable waste across ${analytics.anomalies.length} distinct events. Off-hours waste accounts for ${analytics.offHoursKwh} kWh of total consumption.`;
  let missingDataWarnings = [
    'Submeter granularity is building-level; individual branch circuits are not separately monitored.',
    'Occupancy data is inferred or sensor-sampled; physical headcount verification is recommended before major setpoint changes.',
  ];

  if (locale === 'hi') {
    strategySummary = `WattWise इंजन ने ${analytics.zoneCount} सुविधाओं में ${analytics.readingsCount} रीडिंग का विश्लेषण किया। आधार रेखा से अधिक ${analytics.totalWasteKwh} kWh अतिरिक्त खपत का प्रतिनिधित्व करने वाले ${analytics.anomalies.length} विसंगति निष्कर्ष पाए गए। लक्षित हस्तक्षेप मुख्य रूप से रात के समय के अनियंत्रित HVAC भार और सप्ताहांत संचालन पर केंद्रित हैं।`;
    identifiedWasteSummary = `${analytics.anomalies.length} घटनाओं में ${analytics.totalWasteKwh} kWh रोके जाने योग्य अपव्यय की पहचान की गई। गैर-कार्य समय का अपव्यय कुल खपत का ${analytics.offHoursKwh} kWh है।`;
    missingDataWarnings = [
      'सबमीटरिंग भवन स्तर पर है; व्यक्तिगत शाखा सर्किट अलग से मॉनिटर नहीं किए गए हैं।',
      'उपस्थिति डेटा सेन्सर-आधारित है; मुख्य तापमान सेटपॉइंट बदलने से पहले भौतिक सत्यापन की सिफारिश की जाती है।',
    ];
  } else if (locale === 'mr') {
    strategySummary = `WattWise इंजिनने ${analytics.zoneCount} इमारतींमध्ये ${analytics.readingsCount} नोंदींचे विश्लेषण केले. बेसलाइनपेक्षा जास्त असलेल्या ${analytics.totalWasteKwh} kWh अतिरिक्त वापराचे प्रतिनिधित्व करणारे ${analytics.anomalies.length} विसंगती निष्कर्ष आढळले. मुख्य हस्तक्षेप प्रामुख्याने रात्रीच्या अनियंत्रित HVAC लोड आणि शनिवार-रविवारच्या वापरावर केंद्रित आहेत.`;
    identifiedWasteSummary = `${analytics.anomalies.length} घटनांमध्ये ${analytics.totalWasteKwh} kWh टाळता येणारा अपव्यय ओळखला गेला. ऑफ-तास अपव्यय एकूण वापराच्या ${analytics.offHoursKwh} kWh आहे.`;
    missingDataWarnings = [
      'सबमीटरिंग इमारत स्तरावर आहे; वैयक्तिक सर्किट स्वतंत्रपणे मोजलेले नाहीत.',
      'उपस्थिती डेटा सेन्सरवर आधारित आहे; मोठे बदल करण्यापूर्वी प्रत्यक्ष पडताळणी करण्याची शिफारस केली जाते.',
    ];
  }

  return {
    strategySummary,
    identifiedWasteSummary,
    actions: draftTasks,
    overallConfidence: 0.94,
    missingDataWarnings,
    executionLogs: logs,
    latencyMs: durationMs,
    usedFallback: true,
    modelUsed: 'deterministic-rule-engine-v1',
  };
}
