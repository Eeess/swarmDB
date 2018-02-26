#include "PeerSession.h"

using namespace std;

void fail(boost::system::error_code ec, char const *what);

PeerSession::PeerSession(
    boost::beast::websocket::stream<boost::asio::ip::tcp::socket> ws
) :
    ws_(std::move(ws)),
    strand_(ws_.get_executor().context())
{
    cout << "session [+]" << endl;
}

PeerSession::~PeerSession()
{
    cout << "session [-]" << endl;
}

void
PeerSession::run()
{
    ws_.async_accept
           (
            strand_.wrap
                       (
                           bind
                               (
                                   &PeerSession::on_accept,
                                   shared_from_this(),
                                   placeholders::_1
                               )
                       )
           );
}

void
PeerSession::on_accept(
    boost::system::error_code ec
)
{
    if (ec)
        {
        return fail(ec, "PeerSession::on_accept");
        }
    do_read();
}

void
PeerSession::do_read()
{
    buffer_.consume(buffer_.size());
    ws_.async_read(
            buffer_,
            strand_.wrap(bind(
                    &PeerSession::on_read,
                    shared_from_this(),
                    placeholders::_1,
                    placeholders::_2)));
}

void
PeerSession::on_read(
    boost::system::error_code ec,
    size_t bytes_transferred)
{
    boost::ignore_unused(bytes_transferred);

    if (ec)
        {
        return;// fail(ec, "PeerSession::on_read");
        }


    stringstream ss;
    ss << boost::beast::buffers(buffer_.data());

    buffer_.consume(buffer_.size());

    string response, request = ss.str();

    if (handler_ != nullptr && !request.empty())
        {
        response = handler_(request);
        }


    if (!response.empty())
        {
        ws_.async_write(
            boost::asio::buffer(response),
            strand_.wrap(
                bind(
                    &PeerSession::on_write,
                    shared_from_this(),
                    placeholders::_1,
                    placeholders::_2)));

        }
    else if (schedule_read_)
        {
        do_read();
        }
}

void
PeerSession::on_write
    (
        boost::system::error_code ec,
        size_t bytes_transferred
    )
{
    boost::ignore_unused(bytes_transferred);

    if (ec)
        {
        return fail(ec, "PeerSession::on_write");
        }

    if (schedule_read_)
        {
        do_read();
        }
}

void
PeerSession::set_request_handler
    (
        function<string(const string&)> request_handler
    )
{
    if (request_handler != nullptr)
        {
        handler_ = request_handler;
        }
}

void
PeerSession::write_async(
    const string& request
)
{
    ws_.async_write(
            boost::asio::buffer(request),
            strand_.wrap(
                bind(
                    &PeerSession::on_write,
                    shared_from_this(),
                    placeholders::_1,
                    placeholders::_2)));
}
