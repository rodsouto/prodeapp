import React, {useEffect} from "react";
import {FormError, Box, BoxRow} from "../../components"
import {useQuestions} from "../../hooks/useQuestions";
import {FormControl, MenuItem, Select} from "@mui/material";
import {Control, useFieldArray} from "react-hook-form";
import {UseFormHandleSubmit, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Tournament, Tournament__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import type {BigNumberish} from "ethers";
import {useMatches} from "../../hooks/useMatches";
import {queryClient} from "../../lib/react-query";

export type QuestionsFormValues = {
  outcomes: {value: number|''}[]
}

type QuestionsFormProps = {
  tournamentId: string
  price: BigNumberish
  control: Control<QuestionsFormValues>
  register: UseFormRegister<QuestionsFormValues>
  errors: FieldErrors<QuestionsFormValues>
  handleSubmit: UseFormHandleSubmit<QuestionsFormValues>
}

export default function QuestionsForm({tournamentId, price, control, register, errors, handleSubmit}: QuestionsFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: matches } = useMatches(tournamentId);
  const { data: questions } = useQuestions(tournamentId);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    matches && matches.forEach(() => append({value: ''}))
  }, [matches, append, remove]);

  const { state, send } = useContractFunction(
    new Contract(tournamentId, Tournament__factory.createInterface()) as Tournament,
    'placeBet'
  );

  useEffect(() => {
    if (state.status === 'Success') {
      queryClient.invalidateQueries(['useTournament', tournamentId]);
      queryClient.invalidateQueries(['useRanking', tournamentId]);
      alert('Bet placed!');
    }
  }, [state, tournamentId]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to place a bet.'}</Alert>
  }

  if (error) {
    return <Alert severity="error">Error loading questions.</Alert>
  }

  const onSubmit = async (data: QuestionsFormValues) => {
    const results = data.outcomes.map(outcome => {
      if (outcome.value === '') {
        throw Error('Invalid outcome')
      }

      return hexZeroPad(hexlify(outcome.value), 32)
    });

    await send(
      AddressZero,
      results,
      {
        value: price
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="questions-form">
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <Box>
        <BoxRow>
          <div style={{width: '80%'}}>Question</div>
          <div style={{width: '20%'}}>Outcome</div>
        </BoxRow>
        {fields.map((field, i) => {
          if (!matches || !matches[i] || !questions?.[matches[i].questionID]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{questions[matches[i].questionID].qTitle}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: 'This field is required.'})}
                >
                  {questions[matches[i].questionID].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome.answer}</MenuItem>)}
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
        })}
      </Box>
    </form>
  );
}
