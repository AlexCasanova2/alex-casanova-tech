import { describe, expect, it, vi } from 'vitest'
import { saveQuoteWithCompatibility } from './saveQuote'

const missingFunction = { data:null, error:{code:'PGRST202', message:'Could not find the function public.save_quote_priced(p_items, p_quote) in the schema cache'} }
const quote = {id:null, title:'Web', pricing_mode:'itemized', global_price:1000, terms:'Condiciones personalizadas'}
const items = [{description:'Diseño',quantity:1,unit_price:500}]

describe('quote saving across schema versions', () => {
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
