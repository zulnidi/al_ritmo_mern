import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('carga datos y permite recargar', async () => {
    const loader = vi.fn().mockResolvedValueOnce([1]).mockResolvedValueOnce([1, 2]);
    const { result } = renderHook(() => useAsyncData(loader, []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual([1]));
    await act(() => result.current.reload());
    expect(result.current.data).toEqual([1, 2]);
  });
  it('expone el mensaje de error', async () => {
    const loader = vi.fn().mockRejectedValue({ message: 'falló' });
    const { result } = renderHook(() => useAsyncData(loader, []));
    await waitFor(() => expect(result.current.error).toBe('falló'));
    expect(result.current.loading).toBe(false);
  });
});
