import React from "react";
import {Box, BoxRow} from "../components";
import Button from '@mui/material/Button';
import {Link} from "react-router-dom";
import {useTournaments} from "../hooks/useTournaments";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";
import {Tournament} from "../graphql/subgraph";

function Home() {
  const { loading, error, tournaments } = useTournaments();

  return (
    <>
      <Box>
        <BoxRow style={{textAlign: 'right'}}>
          <Button component={Link} to="/tournaments/new">+ New Tournament</Button>
        </BoxRow>
      </Box>

      {!loading && !error && tournaments && <TournamentsTable tournaments={tournaments}/>}
    </>
  );
}

type TournamentsTableProps = {
  tournaments: Tournament[]
}

function TournamentsTable({tournaments}: TournamentsTableProps) {
  return <Box>
    <BoxRow>
      <div style={{width: '25%'}}>Name</div>
      <div style={{width: '25%'}}>Price</div>
      <div style={{width: '25%'}}>Closing Time</div>
      <div style={{width: '25%'}}>Pool</div>
    </BoxRow>
    {tournaments.map((tournament, i) => {
      return <BoxRow key={i}>
        <div style={{width: '25%'}}>
          <Link to={`/tournaments/${tournament.id.toString()}`} style={{display: 'flex'}} key={i}>{tournament.name}</Link>
        </div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.price,18).toString()}</div>
        <div style={{width: '25%'}}>{tournament.closingTime.toString()}</div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.pool,18).toString()}</div>
      </BoxRow>
    })}
  </Box>
}

export default Home;