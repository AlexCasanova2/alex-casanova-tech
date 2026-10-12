import { describe, expect, it, vi } from 'vitest'
import { saveQuoteWithCompatibility } from './saveQuote'

const missingFunction = { data:null, error:{code:'PGRST202', message:'Could not find the function public.save_quote_priced(p_items, p_quote) in the schema cache'} }
const quote = {id:null, title:'Web', pricing_mode:'itemized', global_price:1000, terms:'Condiciones personalizadas'}
const items = [{description:'Diseño',quantity:1,unit_price:500}]

describe('quote saving across schema versions', () => {
  it('blocks custom column titles before any write when their migration is missing', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,column_titles:{item_description:'Servicios'}},items)).error.code).toBe('COLUMN_TITLES_MIGRATION_REQUIRED')
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('saves trimmed column titles and explicit clearing with the priced function', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:null})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    await saveQuoteWithCompatibility(client,{...quote,column_titles:{item_description:' Servicios ',item_price:' '}},items)
    expect(client.rpc).toHaveBeenLastCalledWith('save_quote_priced',{p_quote:{...quote,column_titles:{item_description:'Servicios'}},p_items:items})
    await saveQuoteWithCompatibility(client,{...quote,column_titles:{}},items)
    expect(client.rpc).toHaveBeenLastCalledWith('save_quote_priced',{p_quote:{...quote,column_titles:{}},p_items:items})
  })
  it('allows default titles with the previous schema', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    await saveQuoteWithCompatibility(client,{...quote,column_titles:{item_description:' '}},items)
    expect(client.rpc).toHaveBeenLastCalledWith('save_quote_priced',{p_quote:quote,p_items:items})
  })
  it('does not write on column title permission errors', async () => {
    const error={code:'42501'}
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,column_titles:{}},items)).error).toBe(error)
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('does not fall back to the legacy RPC and lose custom titles', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:null})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue(missingFunction)}
    expect((await saveQuoteWithCompatibility(client,{...quote,column_titles:{item_price:'Coste'}},items)).error.code).toBe('COLUMN_TITLES_MIGRATION_REQUIRED')
    expect(client.rpc).toHaveBeenCalledOnce()
  })
  it('blocks maintenance inclusion before any write if the migration is missing', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,maintenance_in_total:true},items)).error.code).toBe('MAINTENANCE_TOTAL_MIGRATION_REQUIRED')
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('keeps excluded maintenance compatible with the previous schema', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    await saveQuoteWithCompatibility(client,{...quote,maintenance_in_total:false},items)
    expect(client.rpc).toHaveBeenCalledWith('save_quote_priced',{p_quote:quote,p_items:items})
  })
  it('persists inclusion and explicit exclusion when editing a quote', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:null})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    for (const maintenance_in_total of [true,false]) {
      const payload={...quote,pricing_mode:'global',maintenance_monthly:60,maintenance_in_total}
      await saveQuoteWithCompatibility(client,payload,items)
      expect(client.rpc).toHaveBeenLastCalledWith('save_quote_priced',{p_quote:payload,p_items:items})
    }
  })
  it('does not write or retry if the inclusion schema check fails', async () => {
    const error={code:'42501',message:'Permission denied'}
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,maintenance_in_total:true},items)).error).toBe(error)
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('blocks extras before any write when their migration is missing', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,extras:[{description:'Landing',original_price:500,discounted_price:350}]},items)).error.code).toBe('EXTRAS_MIGRATION_REQUIRED')
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('saves extras and explicit clearing with the priced function', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:null})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    for (const extras of [[{description:'Landing',original_price:500,discounted_price:350}],[]]) {
      await saveQuoteWithCompatibility(client,{...quote,extras},items)
      expect(client.rpc).toHaveBeenLastCalledWith('save_quote_priced',{p_quote:{...quote,extras},p_items:items})
    }
  })
  it('keeps quotes without extras compatible with the old schema', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue({error:null})}
    await saveQuoteWithCompatibility(client,{...quote,extras:[]},items)
    expect(client.rpc).toHaveBeenCalledWith('save_quote_priced',{p_quote:quote,p_items:items})
  })
  it('uses the priced function when available', async () => {
    const success = {data:{id:'q1',pricing_mode:'global',total:1000},error:null}
    const client = {rpc:vi.fn().mockResolvedValue(success)}
    expect(await saveQuoteWithCompatibility(client,{...quote,pricing_mode:'global'},items)).toBe(success)
    expect(client.rpc).toHaveBeenCalledOnce()
    expect(client.rpc).toHaveBeenCalledWith('save_quote_priced',{p_quote:{...quote,pricing_mode:'global'},p_items:items})
  })
  it('saves an itemized draft on the original schema, preserving terms and lines', async () => {
    const success={data:{id:'q1'},error:null}
    const client={rpc:vi.fn().mockResolvedValueOnce(missingFunction).mockResolvedValueOnce(success)}
    expect(await saveQuoteWithCompatibility(client,quote,items)).toBe(success)
    expect(client.rpc).toHaveBeenNthCalledWith(2,'save_quote',{p_quote:{id:null,title:'Web',terms:quote.terms},p_items:items})
    expect(quote.global_price).toBe(1000)
  })
  it('does not save global prices as itemized prices if the migration is missing', async () => {
    const client={rpc:vi.fn().mockResolvedValue(missingFunction)}
    const result=await saveQuoteWithCompatibility(client,{...quote,pricing_mode:'global'},items)
    expect(result.error.code).toBe('PRICING_MIGRATION_REQUIRED')
    expect(client.rpc).toHaveBeenCalledOnce()
  })
  it('checks the maintenance column before saving and keeps it outside line items', async () => {
    const success={data:{id:'q1',pricing_mode:'global',total:1000,maintenance_monthly:50},error:null}
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[],error:null})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn().mockResolvedValue(success)}
    const pricedQuote={...quote,pricing_mode:'global',maintenance_monthly:50}
    expect(await saveQuoteWithCompatibility(client,pricedQuote,items)).toBe(success)
    expect(client.from).toHaveBeenCalledWith('quotes')
    expect(query.select).toHaveBeenCalledWith('maintenance_monthly')
    expect(client.rpc).toHaveBeenCalledWith('save_quote_priced',{p_quote:pricedQuote,p_items:items})
  })
  it('refuses to save maintenance when the new migration is missing', async () => {
    const query={select:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:null,error:{code:'42703'}})}
    const client={from:vi.fn().mockReturnValue(query),rpc:vi.fn()}
    expect((await saveQuoteWithCompatibility(client,{...quote,pricing_mode:'global',maintenance_monthly:50},items)).error.code).toBe('MAINTENANCE_MIGRATION_REQUIRED')
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('does not use the legacy function to change an existing global quote to itemized', async () => {
    const client={rpc:vi.fn().mockResolvedValue(missingFunction)}
    expect((await saveQuoteWithCompatibility(client,{...quote,id:'q1'},items,'global')).error.code).toBe('PRICING_MIGRATION_REQUIRED')
    expect(client.rpc).toHaveBeenCalledOnce()
  })
  it.each(['42501','23514','PGRST000'])('does not retry permission, validation or connection errors (%s)', async code => {
    const failure={data:null,error:{code,message:'Failed'}}
    const client={rpc:vi.fn().mockResolvedValue(failure)}
    expect(await saveQuoteWithCompatibility(client,quote,items)).toBe(failure)
    expect(client.rpc).toHaveBeenCalledOnce()
  })
  it('does not retry a missing function other than save_quote_priced', async () => {
    const failure={data:null,error:{code:'PGRST202',message:'Missing another function'}}
    const client={rpc:vi.fn().mockResolvedValue(failure)}
    expect(await saveQuoteWithCompatibility(client,quote,items)).toBe(failure)
    expect(client.rpc).toHaveBeenCalledOnce()
  })
})
