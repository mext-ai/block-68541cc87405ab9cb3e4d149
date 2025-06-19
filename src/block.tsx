import React, { useState, useEffect, useRef } from 'react';

interface Term {
  id: string;
  text: string;
}

interface Definition {
  id: string;
  text: string;
  correctTermId: string;
}

interface Match {
  termId: string;
  definitionId: string;
}

interface BlockProps {
  title?: string;
  description?: string;
}

const Block: React.FC<BlockProps> = ({ title = "Quiz ISO 13485", description }) => {
  // Données des termes ISO 13485
  const originalTerms: Term[] = [
    { id: 'term_1', text: 'Dispositif médical' },
    { id: 'term_2', text: 'SMQ' },
    { id: 'term_3', text: 'Gestion des risques' },
    { id: 'term_4', text: 'Surveillance post-commercialisation' },
    { id: 'term_5', text: 'Validation' },
    { id: 'term_6', text: 'Dossier technique' }
  ];

  // Données des définitions avec référence au terme correct
  const originalDefinitions: Definition[] = [
    {
      id: 'def_1',
      text: 'Instrument, appareil, équipement, logiciel, implant, réactif, matière ou autre article destiné par le fabricant à être utilisé chez l\'homme à des fins médicales',
      correctTermId: 'term_1'
    },
    {
      id: 'def_2',
      text: 'Système de Management de la Qualité - ensemble d\'éléments corrélés ou en interaction d\'un organisme, utilisés pour établir des politiques, des objectifs et des processus',
      correctTermId: 'term_2'
    },
    {
      id: 'def_3',
      text: 'Application systématique de politiques, procédures et pratiques de management aux tâches d\'analyse, d\'évaluation, de maîtrise et de surveillance du risque',
      correctTermId: 'term_3'
    },
    {
      id: 'def_4',
      text: 'Toutes les activités entreprises par les fabricants conjointement avec les distributeurs pour instituer et tenir à jour une procédure systématique',
      correctTermId: 'term_4'
    },
    {
      id: 'def_5',
      text: 'Confirmation par des preuves tangibles que les exigences pour une application ou un usage spécifique prévu ont été satisfaites',
      correctTermId: 'term_5'
    },
    {
      id: 'def_6',
      text: 'Compilation de documents qui démontre la conformité du dispositif médical aux exigences du présent document',
      correctTermId: 'term_6'
    }
  ];

  // Couleurs pour les connexions
  const connectionColors = [
    '#FF6B6B', // Rouge corail
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bleu
    '#96CEB4', // Vert menthe
    '#FECA57', // Jaune doré
    '#FF9FF3', // Rose
    '#54A0FF', // Bleu clair
    '#5F27CD'  // Violet
  ];

  const [terms, setTerms] = useState<Term[]>([]);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedTerm, setDraggedTerm] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{ correct: number; incorrect: number } | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour mélanger un tableau
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialiser et mélanger les termes et définitions
  useEffect(() => {
    const shuffledTerms = shuffleArray(originalTerms);
    const shuffledDefinitions = shuffleArray(originalDefinitions);
    setTerms(shuffledTerms);
    setDefinitions(shuffledDefinitions);
  }, []);

  // Fonction pour obtenir la couleur d'une connexion
  const getConnectionColor = (termId: string, definitionId: string): string => {
    const matchIndex = matches.findIndex(match => 
      match.termId === termId && match.definitionId === definitionId
    );
    return connectionColors[matchIndex % connectionColors.length];
  };

  // Fonction pour dessiner les lignes de connexion
  const renderConnections = () => {
    if (!containerRef.current || matches.length === 0) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const connections = [];

    matches.forEach((match, index) => {
      const termElement = document.querySelector(`[data-term-id="${match.termId}"]`) as HTMLElement;
      const defElement = document.querySelector(`[data-def-id="${match.definitionId}"]`) as HTMLElement;

      if (termElement && defElement) {
        const termRect = termElement.getBoundingClientRect();
        const defRect = defElement.getBoundingClientRect();

        const x1 = termRect.right - containerRect.left;
        const y1 = termRect.top + termRect.height / 2 - containerRect.top;
        const x2 = defRect.left - containerRect.left;
        const y2 = defRect.top + defRect.height / 2 - containerRect.top;

        const color = connectionColors[index % connectionColors.length];

        connections.push(
          <line
            key={`${match.termId}-${match.definitionId}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="4"
            strokeDasharray="0"
            style={{
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
              animation: 'drawLine 0.5s ease-out'
            }}
          />
        );

        // Ajouter des points aux extrémités
        connections.push(
          <circle
            key={`start-${match.termId}-${match.definitionId}`}
            cx={x1}
            cy={y1}
            r="6"
            fill={color}
            style={{
              filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
            }}
          />
        );

        connections.push(
          <circle
            key={`end-${match.termId}-${match.definitionId}`}
            cx={x2}
            cy={y2}
            r="6"
            fill={color}
            style={{
              filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
            }}
          />
        );
      }
    });

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {connections}
      </svg>
    );
  };

  const handleDragStart = (termId: string) => {
    setDraggedTerm(termId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, definitionId: string) => {
    e.preventDefault();
    if (draggedTerm) {
      createMatch(draggedTerm, definitionId);
      setDraggedTerm(null);
    }
  };

  const handleTermClick = (termId: string) => {
    if (selectedTerm === termId) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(termId);
    }
  };

  const handleDefinitionClick = (definitionId: string) => {
    if (selectedTerm) {
      createMatch(selectedTerm, definitionId);
      setSelectedTerm(null);
    }
  };

  const createMatch = (termId: string, definitionId: string) => {
    // Supprimer les correspondances existantes pour ce terme et cette définition
    const newMatches = matches.filter(
      match => match.termId !== termId && match.definitionId !== definitionId
    );
    
    // Ajouter la nouvelle correspondance
    newMatches.push({ termId, definitionId });
    setMatches(newMatches);

    // Redessiner les connexions après un court délai
    setTimeout(() => {
      // Force re-render for connections
    }, 100);
  };

  const removeMatch = (matchToRemove: Match) => {
    setMatches(matches.filter(match => 
      !(match.termId === matchToRemove.termId && match.definitionId === matchToRemove.definitionId)
    ));
  };

  const checkAnswers = () => {
    if (matches.length !== originalTerms.length) {
      alert('Veuillez associer tous les termes avant de vérifier !');
      return;
    }

    let correct = 0;
    let incorrect = 0;

    matches.forEach(match => {
      const definition = definitions.find(def => def.id === match.definitionId);
      if (definition && definition.correctTermId === match.termId) {
        correct++;
      } else {
        incorrect++;
      }
    });

    setAttempts(prev => prev + 1);
    setLastResult({ correct, incorrect });

    if (correct === originalTerms.length) {
      setIsComplete(true);
      setShowSuccess(true);
      
      // Envoyer l'événement de completion
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'iso-13485-matching-game', 
        completed: true,
        score: correct,
        maxScore: originalTerms.length,
        attempts: attempts + 1
      }, '*');
      window.parent.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'iso-13485-matching-game', 
        completed: true,
        score: correct,
        maxScore: originalTerms.length,
        attempts: attempts + 1
      }, '*');

      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const resetGame = () => {
    setMatches([]);
    setLastResult(null);
    setSelectedTerm(null);
    // Remélanger seulement les définitions pour une nouvelle disposition
    const shuffledDefinitions = shuffleArray(originalDefinitions);
    setDefinitions(shuffledDefinitions);
  };

  const startNewGame = () => {
    setMatches([]);
    setAttempts(0);
    setLastResult(null);
    setIsComplete(false);
    setSelectedTerm(null);
    // Remélanger à la fois les termes et les définitions
    const shuffledTerms = shuffleArray(originalTerms);
    const shuffledDefinitions = shuffleArray(originalDefinitions);
    setTerms(shuffledTerms);
    setDefinitions(shuffledDefinitions);
  };

  const getMatchedDefinitionId = (termId: string) => {
    const match = matches.find(m => m.termId === termId);
    return match?.definitionId;
  };

  const getMatchedTermId = (definitionId: string) => {
    const match = matches.find(m => m.definitionId === definitionId);
    return match?.termId;
  };

  const getTermText = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    return term?.text || '';
  };

  const getMatchColor = (termId: string, definitionId: string) => {
    const matchIndex = matches.findIndex(match => 
      match.termId === termId && match.definitionId === definitionId
    );
    return matchIndex >= 0 ? connectionColors[matchIndex % connectionColors.length] : '#4CAF50';
  };

  // Force re-render of connections when matches change
  useEffect(() => {
    const timer = setTimeout(() => {
      // This will trigger a re-render
    }, 50);
    return () => clearTimeout(timer);
  }, [matches]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {/* Success Animation */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 255, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'pulse 0.5s ease-in-out infinite alternate'
        }}>
          <div style={{
            background: 'white',
            color: '#4CAF50',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            🎉 Félicitations ! 🎉<br/>
            Toutes les réponses sont correctes !<br/>
            <span style={{ fontSize: '18px' }}>
              Réussi en {attempts} tentative{attempts > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Associez les termes ISO 13485 à leurs définitions
        </p>
        
        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '18px'
          }}>
            Tentatives: {attempts}
          </div>
          
          {lastResult && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '18px'
            }}>
              Dernier résultat: {lastResult.correct} ✅ / {lastResult.incorrect} ❌
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto',
          minHeight: '500px'
        }}
      >
        {/* Render connections */}
        {renderConnections()}

        {/* Terms Column */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            fontSize: '1.5rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Termes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {terms.map(term => {
              const matchedDefId = getMatchedDefinitionId(term.id);
              const isSelected = selectedTerm === term.id;
              const matchColor = matchedDefId ? getMatchColor(term.id, matchedDefId) : '#4CAF50';
              
              return (
                <div
                  key={term.id}
                  data-term-id={term.id}
                  draggable
                  onDragStart={() => handleDragStart(term.id)}
                  onClick={() => handleTermClick(term.id)}
                  style={{
                    background: isSelected 
                      ? 'rgba(255, 255, 0, 0.3)' 
                      : matchedDefId 
                        ? `rgba(${parseInt(matchColor.slice(1,3), 16)}, ${parseInt(matchColor.slice(3,5), 16)}, ${parseInt(matchColor.slice(5,7), 16)}, 0.3)` 
                        : 'rgba(255, 255, 255, 0.2)',
                    padding: '20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isSelected ? '3px solid yellow' : matchedDefId ? `3px solid ${matchColor}` : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    userSelect: 'none',
                    boxShadow: isSelected ? '0 0 15px rgba(255, 255, 0, 0.5)' : matchedDefId ? `0 0 15px ${matchColor}40` : '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!matchedDefId) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!matchedDefId && !isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                >
                  {term.text}
                  {matchedDefId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMatch({ termId: term.id, definitionId: matchedDefId });
                      }}
                      style={{
                        marginLeft: '10px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Definitions Column */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            fontSize: '1.5rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Définitions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {definitions.map(def => {
              const matchedTermId = getMatchedTermId(def.id);
              const matchColor = matchedTermId ? getMatchColor(matchedTermId, def.id) : '#4CAF50';
              
              return (
                <div
                  key={def.id}
                  data-def-id={def.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, def.id)}
                  onClick={() => handleDefinitionClick(def.id)}
                  style={{
                    background: matchedTermId 
                      ? `rgba(${parseInt(matchColor.slice(1,3), 16)}, ${parseInt(matchColor.slice(3,5), 16)}, ${parseInt(matchColor.slice(5,7), 16)}, 0.3)`
                      : selectedTerm 
                        ? 'rgba(255, 255, 0, 0.1)' 
                        : 'rgba(255, 255, 255, 0.2)',
                    padding: '20px',
                    borderRadius: '10px',
                    cursor: selectedTerm ? 'pointer' : 'default',
                    border: matchedTermId ? `3px solid ${matchColor}` : selectedTerm ? '2px dashed yellow' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: matchedTermId ? `0 0 15px ${matchColor}40` : '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!matchedTermId && selectedTerm) {
                      e.currentTarget.style.background = 'rgba(255, 255, 0, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!matchedTermId && selectedTerm) {
                      e.currentTarget.style.background = 'rgba(255, 255, 0, 0.1)';
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {def.text}
                    {matchedTermId && (
                      <div style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: matchColor
                      }}>
                        ✓ Associé à: {getTermText(matchedTermId)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '30px auto',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <p style={{ fontSize: '16px', margin: '0' }}>
          <strong>Instructions:</strong> Glissez-déposez ou cliquez sur un terme puis sur sa définition pour les associer. 
          Une fois toutes les associations faites, vérifiez vos réponses !
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={checkAnswers}
          disabled={matches.length !== originalTerms.length}
          style={{
            background: matches.length === originalTerms.length ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: matches.length === originalTerms.length ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Vérifier les réponses ({matches.length}/{originalTerms.length})
        </button>
        
        <button
          onClick={resetGame}
          style={{
            background: '#FF9800',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Réinitialiser
        </button>
        
        <button
          onClick={startNewGame}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Nouvelle partie
        </button>
      </div>

      <style>
        {`
          @keyframes pulse {
            from { opacity: 0.8; }
            to { opacity: 1; }
          }
          
          @keyframes drawLine {
            from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
            to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Block;