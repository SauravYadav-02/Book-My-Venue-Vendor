
import Layout from './Layout'
import DashBoardCard from '../vendor/DashboardStats'
import Bar_chart from '../vendor/componentsVendor/Bar_chart'
import BookingRequests from '../vendor/componentsVendor/BookingRequests'

const MainLayout = () => {
    return (
        <Layout>
            <div className='flex flex-col gap-6 w-full mx-auto'>
                <DashBoardCard />

                <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 items-start'>
                    <div className='xl:col-span-2 w-full'>
                        <Bar_chart />
                    </div>
                    <div className='xl:col-span-1 w-full h-full'>
                        <BookingRequests />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MainLayout