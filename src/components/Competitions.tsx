import React, { useState } from 'react';
import { Trophy, Search, Users, Clock, DollarSign, ExternalLink, Tag, Database, BarChart2, HardDrive, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea, LabelList } from 'recharts';

// Mock data: Competitions (Korean)
const MOCK_COMPETITIONS = [
  {
    id: 1,
    title: '홈 크레딧 - 신용 위험 모델 안정성',
    description: '시간이 지나도 안정적이고 미래 데이터에서 잘 작동하는 신용 평가 모델을 만듭니다.',
    prize: '$105,000',
    teams: 3421,
    deadline: '2개월 남음',
    tags: ['정형 데이터', '금융', '분류'],
    url: 'https://www.kaggle.com/competitions/home-credit-credit-risk-model-stability',
    type: '추천 대회'
  },
  {
    id: 2,
    title: '자동 에세이 채점 2.0',
    description: '학생이 작성한 에세이의 자동 채점 시스템 알고리즘을 개선합니다.',
    prize: '$50,000',
    teams: 2150,
    deadline: '1개월 남음',
    tags: ['자연어처리', '텍스트 분류', '교육'],
    url: 'https://www.kaggle.com/competitions/learning-agency-lab-automated-essay-scoring-2',
    type: '추천 대회'
  },
  {
    id: 3,
    title: '이미지 매칭 챌린지 2024',
    description: '6가지 다른 도메인의 2D 이미지들을 활용하여 3D 장면을 재구성합니다.',
    prize: '$50,000',
    teams: 1205,
    deadline: '3개월 남음',
    tags: ['컴퓨터 비전', '이미지 검색'],
    url: 'https://www.kaggle.com/competitions/image-matching-challenge-2024',
    type: '연구'
  },
  {
    id: 4,
    title: '타이타닉 - 머신러닝 입문',
    description: '머신러닝의 시작! 타이타닉 탑승객의 생존 여부를 예측하며 기초를 다져보세요.',
    prize: '지식 획득',
    teams: 15420,
    deadline: '상시 진행',
    tags: ['정형 데이터', '이진 분류', '입문자용'],
    url: 'https://www.kaggle.com/competitions/titanic',
    type: '입문용'
  },
  {
    id: 5,
    title: '주택 가격 - 고급 회귀 기법',
    description: '주택 판매 가격을 예측하고 특성 공학, 랜덤 포레스트, 그래디언트 부스팅을 연습합니다.',
    prize: '지식 획득',
    teams: 4320,
    deadline: '상시 진행',
    tags: ['정형 데이터', '회귀', '입문자용'],
    url: 'https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques',
    type: '입문용'
  },
  {
    id: 6,
    title: '숫자 인식기 (Digit Recognizer)',
    description: '유명한 MNIST 데이터셋으로 컴퓨터 비전과 딥러닝의 기초를 학습합니다.',
    prize: '지식 획득',
    teams: 2890,
    deadline: '상시 진행',
    tags: ['컴퓨터 비전', '다중 분류', '입문자용'],
    url: 'https://www.kaggle.com/competitions/digit-recognizer',
    type: '입문용'
  }
];

// Mock data: Benchmarks (Artificial Analysis LLM Models - Graph Data)
const BENCHMARK_DATA = [
  { id: 1, title: 'GPT-5.4 (xhigh)', provider: 'OpenAI', price: 5.60, index: 57, url: 'https://artificialanalysis.ai/models/gpt-4o' },
  { id: 2, title: 'GPT-5.4 mini (xhigh)', provider: 'OpenAI', price: 1.80, index: 52, url: 'https://artificialanalysis.ai/models/gpt-4o-mini' },
  { id: 3, title: 'Claude Sonnet 4.6 (max)', provider: 'Anthropic', price: 6.00, index: 51, url: 'https://artificialanalysis.ai/models/claude-3-5-sonnet' },
  { id: 4, title: 'Claude Opus 4.6 (max)', provider: 'Anthropic', price: 10.00, index: 53, url: 'https://artificialanalysis.ai/models/claude-3-opus' },
  { id: 5, title: 'Gemini 3.1 Pro Preview', provider: 'Google', price: 4.50, index: 57, url: 'https://artificialanalysis.ai/models/gemini-1-5-pro' },
  { id: 6, title: 'Gemini 3.1 Flash-Lite Preview', provider: 'Google', price: 0.60, index: 33, url: 'https://artificialanalysis.ai/models/gemini-1-5-flash' },
  { id: 7, title: 'DeepSeek V3.2', provider: 'DeepSeek', price: 0.20, index: 41, url: 'https://artificialanalysis.ai/models/deepseek-coder-v2' },
  { id: 8, title: 'Mistral Large 3', provider: 'Mistral', price: 0.70, index: 24, url: 'https://artificialanalysis.ai/models/mistral-large-2' },
  { id: 9, title: 'Grok 4.20 Beta', provider: 'xAI', price: 3.00, index: 48, url: 'https://artificialanalysis.ai/models/grok-1-5' },
  { id: 10, title: 'Llama 4 Maverick', provider: 'Meta', price: 0.50, index: 16, url: 'https://artificialanalysis.ai/models/llama-3-70b-instruct' },
];

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': '#171717',
  'Anthropic': '#d97757',
  'Google': '#22c55e',
  'Meta': '#3b82f6',
  'DeepSeek': '#1d4ed8',
  'Mistral': '#f97316',
  'xAI': '#8b5cf6'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-bold text-gray-900">{data.title}</p>
        <p className="text-sm text-gray-600">제공자: {data.provider}</p>
        <p className="text-sm text-gray-600">가격: ${data.price.toFixed(2)} / 1M tokens</p>
        <p className="text-sm text-gray-600">지능 지수: {data.index}</p>
      </div>
    );
  }
  return null;
};

// Mock data: Datasets
const MOCK_DATASETS = [
  {
    id: 1,
    title: 'AI Hub (AI 허브)',
    description: '한국지능정보사회진흥원(NIA)에서 제공하는 한국어, 비전, 음성 등 다양한 인공지능 학습용 데이터셋입니다.',
    source: '정부/공공 (국내)',
    size: '다양함',
    url: 'https://aihub.or.kr/'
  },
  {
    id: 2,
    title: 'Hugging Face Datasets',
    description: 'NLP, 비전, 오디오 등 다양한 분야의 머신러닝 데이터셋을 쉽게 다운로드하고 사용할 수 있는 허브입니다.',
    source: '오픈소스 플랫폼',
    size: '100K+ 데이터셋',
    url: 'https://huggingface.co/datasets'
  },
  {
    id: 3,
    title: 'Kaggle Datasets',
    description: '전 세계 데이터 과학자들이 공유하는 방대한 양의 정형/비정형 데이터셋 커뮤니티 플랫폼입니다.',
    source: '커뮤니티',
    size: '250K+ 데이터셋',
    url: 'https://www.kaggle.com/datasets'
  },
  {
    id: 4,
    title: '공공데이터포털',
    description: '국가에서 보유하고 있는 다양한 공공데이터를 개방하여 제공하는 통합 포털입니다.',
    source: '정부/공공 (국내)',
    size: '다양함',
    url: 'https://www.data.go.kr/'
  }
];

type TabType = 'competitions' | 'benchmarks' | 'datasets';

export function Competitions() {
  const [activeTab, setActiveTab] = useState<TabType>('competitions');
  const [searchTerm, setSearchTerm] = useState('');

  const renderCompetitions = () => {
    const filtered = MOCK_COMPETITIONS.filter(comp => 
      comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.map((comp) => (
      <a 
        key={comp.id}
        href={comp.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-all hover:-translate-y-1 group"
      >
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            comp.type === '추천 대회' ? 'bg-purple-100 text-purple-700' :
            comp.type === '연구' ? 'bg-emerald-100 text-emerald-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {comp.type}
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {comp.title}
        </h3>
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1">
          {comp.description}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">{comp.prize}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Users className="w-4 h-4 mr-2 text-blue-600" />
            <span>{comp.teams.toLocaleString()} 팀 참여</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-orange-500" />
            <span>{comp.deadline}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
          {comp.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </a>
    ));
  };

  const renderBenchmarks = () => {
    const filtered = BENCHMARK_DATA.filter(bench => 
      bench.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bench.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) return [];

    return [
      <div key="benchmark-chart-container" className="col-span-full space-y-6">
        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">지능 vs. 가격</h2>
            <p className="text-sm text-gray-500">인공 분석 지능 지수; 가격: 100만 토큰당 USD</p>
          </div>
          
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-green-100 border border-green-200"></div>
              <span className="text-gray-600">가장 매력적인 사분면</span>
            </div>
            {Object.entries(PROVIDER_COLORS).map(([provider, color]) => (
              <div key={provider} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-gray-600">{provider}</span>
              </div>
            ))}
          </div>

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="price" 
                  name="Price" 
                  unit="$" 
                  domain={[0, 11]} 
                  tickCount={12}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  label={{ value: 'Price (USD per M Tokens)', position: 'insideBottom', offset: -25 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="index" 
                  name="Index" 
                  domain={[15, 80]} 
                  tickCount={14}
                  label={{ value: 'Artificial Analysis Intelligence Index', angle: -90, position: 'insideLeft', offset: -10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrant Backgrounds */}
                <ReferenceArea x1={0} x2={5.5} y1={45} y2={80} {...({ fill: '#dcfce7', fillOpacity: 0.5 } as any)} />
                <ReferenceArea x1={5.5} x2={11} y1={15} y2={45} {...({ fill: '#f3f4f6', fillOpacity: 0.5 } as any)} />

                <Scatter name="Models" data={filtered}>
                  {filtered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[entry.provider] || '#cbd5e1'} />
                  ))}
                  <LabelList dataKey="title" position="top" style={{ fontSize: '11px', fill: '#4b5563' }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">모델 (Model)</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">제공자 (Provider)</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">가격 (Price / 1M Tokens)</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">지능 지수 (Index)</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">상세보기</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((bench) => (
                  <tr key={bench.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{bench.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: PROVIDER_COLORS[bench.provider] || '#cbd5e1' }}
                      >
                        {bench.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${bench.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bench.index}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={bench.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                        자세히 <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ];
  };

  const renderDatasets = () => {
    const filtered = MOCK_DATASETS.filter(dataset => 
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.map((dataset) => (
      <a 
        key={dataset.id}
        href={dataset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-all hover:-translate-y-1 group"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1">
            <Database className="w-3 h-3" />
            {dataset.source}
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {dataset.title}
        </h3>
        <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-1">
          {dataset.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-700">
            <HardDrive className="w-4 h-4 mr-2 text-teal-600" />
            <span className="font-medium">규모: {dataset.size}</span>
          </div>
        </div>
      </a>
    ));
  };

  const getEmptyMessage = () => {
    if (activeTab === 'competitions') return '검색된 대회가 없습니다.';
    if (activeTab === 'benchmarks') return '검색된 벤치마크가 없습니다.';
    return '검색된 데이터셋이 없습니다.';
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-600" />
            대회 및 데이터
          </h1>
          <p className="text-gray-500 mt-1">AI 모델 학습을 위한 대회, 벤치마크, 데이터셋 정보를 탐색하세요.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이름 또는 태그 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('competitions')} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'competitions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          🏆 대회 (Competitions)
        </button>
        <button 
          onClick={() => setActiveTab('benchmarks')} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'benchmarks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          📊 벤치마크 (Benchmarks)
        </button>
        <button 
          onClick={() => setActiveTab('datasets')} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'datasets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          🗄️ 데이터셋 (Datasets)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
        {activeTab === 'competitions' && renderCompetitions()}
        {activeTab === 'benchmarks' && renderBenchmarks()}
        {activeTab === 'datasets' && renderDatasets()}
        
        {/* Empty State */}
        {((activeTab === 'competitions' && renderCompetitions().length === 0) ||
          (activeTab === 'benchmarks' && renderBenchmarks().length === 0) ||
          (activeTab === 'datasets' && renderDatasets().length === 0)) && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">{getEmptyMessage()}</p>
            <p className="text-sm mt-1">다른 키워드로 검색해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
