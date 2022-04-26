import React, {useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {useParams, useSearchParams} from "react-router-dom";
import {Box, BoxRow} from "../components"
import Button from '@mui/material/Button';
import {formatAmount} from "../lib/helpers";
import {useTournamentStatus} from "../hooks/useTournamentStatus";
import {DIVISOR} from "../components/TournamentCreate/TournamentForm";
import Ranking from "../components/TournamentView/Ranking";
import Results from "../components/TournamentView/Results";
import PlaceBet from "../components/TournamentView/PlaceBet";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { data: tournamentStatus} = useTournamentStatus(String(id));
  const [section, setSection] = useState<'ranking'|'results'>('ranking');
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!tournament) {
    return searchParams.get('new') === '1'
            ? <div>This tournament was just created, please wait a few seconds for it to be indexed.</div>
            : <div>Tournament not found</div>
  }

  return (
    <>
      <div style={{display: 'flex', marginBottom: '20px'}}>
        <div style={{width: '49%', textAlign: 'center'}}>
          <Box style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '25px', width: '100%'}}>{tournament.name}</div>
            <div style={{fontSize: '18px', width: '100%', marginTop: 15}}>
              Status: {tournamentStatus}
            </div>
          </Box>
        </div>
        <div style={{width: '49%', marginLeft: '2%'}}>
          <Box style={{height: '100%'}}>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Pool</div>
              <div style={{width: '50%'}}>{formatAmount(tournament.pool)}</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Management Fee</div>
              <div style={{width: '50%'}}>{Number(tournament.managementFee) * 100 / DIVISOR}%</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Prize Distribution</div>
              <div style={{width: '50%'}}>
                {[4000, 3000, 2000, 1000].map((value, index) => <div key={index}>#{index+1}: {Number(value) * 100 / DIVISOR}%</div>)}
              </div>
            </BoxRow>
          </Box>
        </div>
      </div>

      <PlaceBet tournament={tournament} />

      <Box>
        <BoxRow style={{justifyContent: 'center'}}>
          <div><Button onClick={() => setSection('ranking')} color={section === 'ranking' ? 'secondary' : 'primary'}>Ranking</Button></div>
          <div><Button onClick={() => setSection('results')} color={section === 'results' ? 'secondary' : 'primary'}>Results</Button></div>
        </BoxRow>
      </Box>

      {section === 'results' && id && <Results tournamentId={id} />}

      {section === 'ranking' && id && <Ranking tournamentId={id} />}
    </>
  );
}

export default TournamentsView;
