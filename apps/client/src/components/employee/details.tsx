"use client";

import { LIMIT_DEFAULT, apiClientQuery } from "ts-contract";
import { formatHireDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { DepartmentForm } from "@/components/employee/department/form";
import { HistoryList } from "@/components/employee/department/history-list";
import { useQueryClient } from "@ts-rest/react-query/tanstack";
import { Pagination } from "./pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@nextui-org/react";

interface DetailsProps {
  id: string;
}

export function Details({ id }: DetailsProps) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();
  const apiEmployees = apiClientQuery.employees;

  const { data: employeeData, isLoading: employeeLoading } =
    apiEmployees.getOne.useQuery(["employees", id], {
      query: { id },
    });
  const { data: employeeHistory, isLoading: loadingHistory } =
    apiEmployees.getDepartmentHistory.useQuery(["employee-history", page, id], {
      query: {
        page: String(page),
        limit: String(LIMIT_DEFAULT),
        employeeId: id,
      },
    });

  const employee = employeeData?.body;
  const departmentHistories = employeeHistory?.body;

  const { mutate } = apiEmployees.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["employees", id]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };
  const totalOfPage =
    Math.ceil((departmentHistories?.totalHistories ?? 0) / LIMIT_DEFAULT) ?? 1;
  const toggleActiveStatus = () => {
    mutate({
      body: {
        id: Number(id),
        isActive: !employee?.isActive,
        avatar: employee?.avatar!,
        firstName: employee?.firstName!,
        lastName: employee?.lastName!,
        phone: employee?.phone!,
        address: employee?.address!,
        departmentId: employee?.departmentId!,
        hireDate: employee?.hireDate!,
      },
    });
  };

  if (employeeLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[80vh] w-full p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 bg-gray-200 rounded-lg">
            {employee?.avatar ? (
              <Avatar
                src={employee.avatar}
                alt={`${employee.firstName} ${employee.lastName}`}
                isBordered
                isDisabled={!employee.isActive}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            {!employee?.isActive && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                Inactive
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{`${employee?.firstName} ${employee?.lastName}`}</h2>
            <p className="text-gray-600">{employee?.department?.name}</p>
            <p className="text-gray-600">{employee?.phone}</p>
            <p className="text-gray-600">{employee?.address}</p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold">Hire Date</p>
          <p className="text-gray-600">{formatHireDate(employee?.hireDate!)}</p>
          <Button
            color={employee?.isActive ? "danger" : "success"}
            className="mt-2"
            onClick={toggleActiveStatus}
          >
            {employee?.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
      {employee && <DepartmentForm employee={employee} />}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Department History</h3>
        {employee?.departmentHistories && (
          <div className="flex items-end flex-col">
            <HistoryList
              departmentHistories={departmentHistories?.histories}
              isLoading={loadingHistory}
            />
            <Pagination
              total={totalOfPage}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
