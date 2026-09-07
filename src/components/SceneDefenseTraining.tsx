import React, { useState } from 'react';
import { ProjectItem, UserSession } from '../types';
import DefenseSelectorScreen from './defense/DefenseSelectorScreen';
import DefensePrepScreen from './defense/DefensePrepScreen';
import DefenseRoadshowScreen from './defense/DefenseRoadshowScreen';
import DefenseSessionScreen from './defense/DefenseSessionScreen';
import DefenseReportScreen from './defense/DefenseReportScreen';
import { DefenseProject, ModeDef, DefenseSessionConfig, DefenseHistoryItem, RoadshowEvaluation } from './defense/defenseTypes';
import { MOCK_DEFENSE_PROJECTS, TRAINING_MODES } from './defense/defenseConstants';

interface SceneDefenseTrainingProps {
  currentProject?: ProjectItem;
  session?: UserSession;
}

export default function SceneDefenseTraining({ currentProject, session }: SceneDefenseTrainingProps) {
  const [view, setView] = useState<'selector' | 'prep' | 'roadshow' | 'session' | 'report'>('selector');
  const [selectedProject, setSelectedProject] = useState<DefenseProject>(() => {
    if (currentProject) {
      return {
        id: currentProject.id,
        name: currentProject.name,
        track: `${currentProject.trackLabel} · ${currentProject.groupLabel || '主赛道'}`,
        summary: currentProject.strengthsLabels?.[0] ? `核心优势：${currentProject.strengthsLabels.join('、')}。重点突破关键测量与精密质检技术壁垒。` : '突破关键测量与精密质检技术壁垒，实现工业产线自主可控。',
        tags: ['当前参赛项目', '校内A类重点', '知识产权合规', '已入选国赛攻坚'],
        isCurrentProject: true
      };
    }
    return MOCK_DEFENSE_PROJECTS[0];
  });

  const [selectedMode, setSelectedMode] = useState<ModeDef>(TRAINING_MODES[0]);
  const [currentConfig, setCurrentConfig] = useState<DefenseSessionConfig>({
    judgeMode: 'single',
    difficulty: 'standard',
    rounds: 'unlimited',
    timeLimit: 90,
    elevatorDuration: '1min',
    roadshowDuration: '5min',
    teleprompterMode: 'full_script',
    autoTransitionToQA: true
  });
  const [isReplay, setIsReplay] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState<DefenseHistoryItem | undefined>();
  const [isPostRoadshow, setIsPostRoadshow] = useState(false);
  const [roadshowEvaluation, setRoadshowEvaluation] = useState<RoadshowEvaluation | undefined>();

  const handleStartPrep = (p: DefenseProject, m: ModeDef, config: DefenseSessionConfig) => {
    setSelectedProject(p);
    setSelectedMode(m);
    setCurrentConfig(config);
    setIsReplay(false);
    setIsPostRoadshow(false);
    setRoadshowEvaluation(undefined);
    setView('prep');
  };

  const handleStartSession = () => {
    if (selectedMode.id === 'roadshow') {
      setView('roadshow');
    } else {
      setView('session');
    }
  };

  const handleFinishRoadshow = (evalData: RoadshowEvaluation, proceedToQA: boolean) => {
    setRoadshowEvaluation(evalData);
    if (proceedToQA) {
      setIsPostRoadshow(true);
      setView('session');
    } else {
      setView('report');
    }
  };

  const handleViewReport = (p: DefenseProject, m: ModeDef, historyItem?: DefenseHistoryItem) => {
    setSelectedProject(p);
    setSelectedMode(m);
    setActiveHistoryItem(historyItem);
    setView('report');
  };

  const handleFinish = () => {
    setView('report');
  };

  const handleRestart = () => {
    setView('selector');
    setIsReplay(false);
    setIsPostRoadshow(false);
    setRoadshowEvaluation(undefined);
  };

  const handleReplay = () => {
    setIsReplay(true);
    setView('prep');
  };

  return (
    <div className="w-full">
      {view === 'selector' && (
        <DefenseSelectorScreen
          initialProject={selectedProject}
          onStart={handleStartPrep}
          onViewReport={handleViewReport}
        />
      )}

      {view === 'prep' && selectedProject && selectedMode && (
        <DefensePrepScreen
          project={selectedProject}
          mode={selectedMode}
          config={currentConfig}
          onStartSession={handleStartSession}
          onBack={() => setView('selector')}
          skipAnalysis={isReplay}
        />
      )}

      {view === 'roadshow' && selectedProject && selectedMode && (
        <DefenseRoadshowScreen
          project={selectedProject}
          mode={selectedMode}
          config={currentConfig}
          onFinishRoadshow={handleFinishRoadshow}
          onBack={() => setView('prep')}
        />
      )}

      {view === 'session' && selectedProject && selectedMode && (
        <DefenseSessionScreen
          project={selectedProject}
          mode={selectedMode}
          config={currentConfig}
          onFinish={handleFinish}
          onBack={() => setView(isPostRoadshow ? 'roadshow' : 'prep')}
          isPostRoadshow={isPostRoadshow}
          roadshowEval={roadshowEvaluation}
        />
      )}

      {view === 'report' && selectedProject && selectedMode && (
        <DefenseReportScreen
          project={selectedProject}
          mode={selectedMode}
          onRestart={handleRestart}
          onReplay={handleReplay}
          historyItem={activeHistoryItem}
          roadshowEvaluation={roadshowEvaluation}
        />
      )}
    </div>
  );
}

