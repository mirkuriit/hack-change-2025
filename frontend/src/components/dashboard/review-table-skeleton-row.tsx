"use client";

export function ReviewTableSkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="h-16 align-middle">
        <div className="mx-auto h-9 w-9 rounded-full bg-[#edf0f7]" />
      </td>
      <td className="h-16 align-middle">
        <div className="mx-auto h-4 w-24 rounded bg-[#edf0f7]" />
      </td>
      <td className="h-16 px-4 align-middle">
        <div className="h-4 w-full rounded bg-[#edf0f7]" />
      </td>
      <td className="h-16 align-middle">
        <div className="mx-auto h-4 w-8 rounded bg-[#edf0f7]" />
      </td>
    </tr>
  );
}
